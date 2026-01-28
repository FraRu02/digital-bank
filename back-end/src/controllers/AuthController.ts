import UserModel, {type UserSchemaProps, type UserDocument, UserRole, UserStatus } from "../models/UserModel";
import { NextFunction, Request, Response } from "express";
import JwtController from "./JwtController";
import {  type SigninRequest, type LoginRequest, VerifyOtpRequest } from "@/schemas/AuthSchema";
import { type HydratedDocument } from "mongoose";
import ResendEmail from "@/classes/ResendEmail";
import Otp from "@/classes/Otp";
import bcrypt from "bcrypt";
import UserController from "./UserController";

abstract class AuthController {


  static async authenticate(req:Request, res:Response, next:NextFunction|null) {
    try {
      const accessToken = req.cookies.access_token;
      const tempToken = req.cookies.temp_token;
      if(accessToken) {
        const userId = JwtController.verifyAccessJwt(accessToken);
        if(userId) {
          const user = await UserModel.getInstance().getById(userId);
          if(user.status === UserStatus.active) {
            if(next) {
              (req as AuthRequest).user = user;
              next();
            }else res.status(200).send(user);
            return;
          }
        }else {
          return res.sendStatus(403);
        }
      }
      if(tempToken) {
        const verifyTempJwt = await JwtController.verifyTempJwt(tempToken);
        if(verifyTempJwt.isVerify) {
          const user = await UserModel.getInstance().getById(verifyTempJwt.payload.userId, null, {select: "+otpExpiresAt +otpAttempts"});
          if(user.status === UserStatus.pending_verification) {
            if(next) {
              res.sendStatus(401);
            }else res.status(200).send(user);
            return;
          }
        }
      }
      res.sendStatus(401);
    } catch (error:any) {
      console.error(error);
      res.status(400).send(error.message)
    }
  }
  

  static async signin(req:SigninRequest, res:Response):Promise<void> {
    const {email} = req.body;
    try {
      const otp = await Otp.generate();
      const newUser = await UserModel.getInstance().create([{
        ...req.body,
        role: UserRole.member,
        otpCodeHash: otp.otpCodeHash,
        otpExpiresAt: otp.otpExpiresAt,
        otpAttempts: otp.otpAttempts
      }]).then((res) => res[0]);
      await ResendEmail.getInstance().sendEmail({
        to: email,
        subject: 'Verifica email',
        html: `Il tuo codice di verifica è: <strong>${otp.otp}</strong>`,
      });
      res.cookie("temp_token", JwtController.generateTempJwt(newUser.id), { httpOnly: true, secure: false });
      res.status(200).send({...newUser.toJSON(), otpCodeHash: undefined});
    } catch (error:any) {
      console.error(error);
      res.status(400).send(error.message)
    }
  }
  
  static async login (req:LoginRequest, res:Response) {
    const body = req.body;
    try {
      const foundedUser = await UserModel.getInstance().getOne({email: body.email}, null, {select: "+password +otpExpiresAt +otpAttempts"});
      await UserController.comparePassword(body.password, foundedUser.password);
      if(foundedUser.status === UserStatus.pending_verification) {
        res.clearCookie('access_token', {
          httpOnly: true,
          path: '/'      // Assicurati che il path corrisponda a quello originale
        }).clearCookie('refresh_token', {
          httpOnly: true,
          path: '/'
        });
        if(foundedUser.otpExpiresAt.valueOf() < new Date().valueOf()){
          const newOtp = await Otp.generate();
          foundedUser.otpCodeHash = newOtp.otpCodeHash;
          foundedUser.otpExpiresAt = newOtp.otpExpiresAt;
          foundedUser.otpAttempts = newOtp.otpAttempts;
          await foundedUser.save();
          await ResendEmail.getInstance().sendEmail({
            to: foundedUser.email,
            subject: 'Verifica email',
            html: `Il tuo codice di verifica è: <strong>${newOtp.otp}</strong>`,
          });
          res.cookie("temp_token", JwtController.generateTempJwt(foundedUser.id), { httpOnly: true, secure: false });
          return res.status(200).send(foundedUser);
        }
        return res.status(200).send(foundedUser);
        
        // if(foundedUser.otpAttempts >= 5) {
        //   return res.status(200).send(foundedUser);
        // }
        
      }else {
        res.cookie("access_token", JwtController.generateAccessJwt(foundedUser.id), { httpOnly: true, secure: false });
        res.cookie("refresh_token", JwtController.generateRefreshJwt(foundedUser.id), { httpOnly: true, secure: false });
        res.status(200).send({...foundedUser.toJSON(), otpExpiresAt: undefined, otpAttempts: undefined});
      }
    } catch (error:any) {
      console.error(error);
      res.status(400).send(error.message)
    }
  }

  
  static async logout (req:Request, res:Response):Promise<void> {
    res.clearCookie('access_token', {
      httpOnly: true,
      path: '/'      // Assicurati che il path corrisponda a quello originale
    }).clearCookie('refresh_token', {
      httpOnly: true,
      path: '/'      // Assicurati che il path corrisponda a quello originale
    }).sendStatus(200);
  }
  
  static async refreshToken(req:Request, res:Response):Promise<void> {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {res.sendStatus(401); return};
    const userId = JwtController.verifyRefreshJwt(refreshToken);

    if (!userId) {res.sendStatus(403); return;};
    res.cookie("access_token", JwtController.generateAccessJwt(userId), { httpOnly: true, secure: false });
    res.cookie("refresh_token", JwtController.generateRefreshJwt(userId), { httpOnly: true, secure: false });
    res.sendStatus(200);
  }

  static async verifyOtp(req:VerifyOtpRequest, res:Response) {
    try {
      const tempToken = req.cookies.temp_token;
      const {code:otpCode} = req.body;
      if (!tempToken) return res.sendStatus(401);
      const verifyTempJwt = await JwtController.verifyTempJwt(tempToken);
      if (!verifyTempJwt.isVerify) return res.sendStatus(401);
      const user = await UserModel.getInstance().getById(verifyTempJwt.payload.userId, null, {select: "+otpCodeHash +otpExpiresAt +otpAttempts"});
      // controlli sicurezza
      if (user.otpExpiresAt < new Date()) {
        return res.status(400).send({ message: "OTP expired" });
      }

      if (user.otpAttempts! >= 5) {
        return res.status(429).send({ message: "Too many attempts" });
      }

      const valid = await bcrypt.compare(otpCode, user.otpCodeHash);

      if (!valid) {
        user.otpAttempts! += 1;
        await user.save();
        return res.status(400).send({ message: "Incorrect OTP" });
      }
      user.status = UserStatus.active;
      const updatedUser = await user.save();
      res.cookie("access_token", JwtController.generateAccessJwt(updatedUser.id), { httpOnly: true, secure: false });
      res.cookie("refresh_token", JwtController.generateRefreshJwt(updatedUser.id), { httpOnly: true, secure: false });
      res.clearCookie('temp_token', {
        httpOnly: true,
        path: '/'      // Assicurati che il path corrisponda a quello originale
      }).status(200).send({...updatedUser.toJSON(), otpAttempts: undefined, otpCodeHash: undefined});
    } catch (error:any) {
      console.error(error);
      res.status(400).send(error.message)
    }
  }

  static async resendOtp(req:Request, res:Response) {
    try {
      const tempToken = req.cookies.temp_token;
      if (tempToken) {
        const verifyTempJwt = await JwtController.verifyTempJwt(tempToken);
        if(!verifyTempJwt.isVerify) {
          const userId = verifyTempJwt.payload.userId;
          const user = await UserModel.getInstance().getById(userId);
          const newOtp = await Otp.generate();
          user.otpCodeHash = newOtp.otpCodeHash;
          user.otpExpiresAt = newOtp.otpExpiresAt;
          user.otpAttempts = newOtp.otpAttempts;
          const updatedUser = await user.save();
          await ResendEmail.getInstance().sendEmail({
            to: user.email,
            subject: 'Verifica email',
            html: `Il tuo codice di verifica è: <strong>${newOtp.otp}</strong>`,
          });
          res.cookie("temp_token", JwtController.generateTempJwt(updatedUser.id), { httpOnly: true, secure: false });
          return res.status(200).send({...updatedUser.toJSON(), otpCodeHash: undefined});
        }else {
          return res.sendStatus(400);
        }
      }else {
        return res.sendStatus(401);
      }
    } catch (error:any) {
      console.error(error);
      res.status(400).send(error.message)
    }
  }


  // static async haveUserPermissions(userId:string, userRoles: Array<UserRole>):Promise<string> {
  //   const user = await UserModel.getById(userId);
  //   const permission = userRoles.includes(user!.role as UserRole);
  //   if(!permission) {
  //     throw new Error("Permission denied");
  //   }
  //   return user!.role;
  // }


}

export type AuthRequest<
  P = {},   // Params
  ResBody = any,  // Response body
  ReqBody = any,  // Request body
  ReqQuery = any  // Query string
> = Request<P, ResBody, ReqBody, ReqQuery> & { user?: HydratedDocument<UserSchemaProps> };

export default AuthController;