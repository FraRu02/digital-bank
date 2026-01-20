import { type AuthRequest } from "@/controllers/AuthController";
import UserModel, { type UserRole } from "@/models/UserModel";
import { type NextFunction, type Request, type Response } from "express";
import * as z from "zod"; 

export const validateSchema = <T extends AuthRequest>(schema: z.ZodObject|z.ZodUnion|z.ZodArray) => {
  return async(req:T, res:Response, next:NextFunction) => {
    const result = await schema.safeParseAsync(req.body);
    if (!result.success) {
      res.status(400).send(z.treeifyError(result.error));  
      return;
    }
    req.body = result.data; // ✅ ora tipato e pulito
    next();
  };
};

export const hasUserPermissions = (userRoles: Array<UserRole>) => {
  return async(req:AuthRequest, res: Response, next?: NextFunction):Promise<void> => {
    const userRole = req.user!.role;
    const permission = userRoles.includes(userRole);
    if(!permission) {
      res?.sendStatus(401);
      throw new Error("No user permission")
    } 
    next?.();
  } 
}