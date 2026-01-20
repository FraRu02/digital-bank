import { Response } from "express";
import UserModel from "../models/UserModel";
import { type AuthRequest } from "./AuthController";
import { DeleteRequest, GetTransactionsRequest, UpdateRequest, type GetBankAccountRequest, type GetRequest } from "@/schemas/UserSchema";
import BankAccountModel from "@/models/BankAccountModel";
import TransactionModel from "@/models/TransactionModel";
import bcrypt from "bcrypt";

abstract class UserController {

  static async create(req:AuthRequest, res:Response) {
    try {
      const newUser = await UserModel.getInstance().create([req.body]);
      res.status(200).send(newUser);
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async get(req:GetRequest, res:Response) {
    try {
      const {id} = req.params;
      if(!id) {
        const allUsers = await UserModel.getInstance().getAll();
        res.status(200).send(allUsers);
        return;
      }else {
        const user = await UserModel.getInstance().getById(id);
        res.status(200).send(user);
        return;
      }
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async getBankAccount(req:GetBankAccountRequest, res:Response) {
     try {
      const {id} = req.params;
      const accounts = await BankAccountModel.getInstance().getMany({userId: id});
      res.status(200).send(accounts);
      return;
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async getTransactions(req:GetTransactionsRequest, res:Response) {
    try {
      const {id} = req.params;
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getUTCMonth() - 3);
      const transactions = await TransactionModel.getInstance().getByUserId(id, {
         createdAt: { $gte: cutoff },
      });
      res.status(200).send(transactions);
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async update(req: UpdateRequest, res: Response) {
    try {
      const users = await UserModel.getInstance().bulkWriteById(req.body);
      res.status(200).send(users)
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async delete(req: DeleteRequest, res: Response) {
    try {
      const {userIds} = req.body;
      await UserModel.getInstance().deleteManyById(userIds);
      res.status(200).send("Successfull deleted")
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async cryptPassword(password:string):Promise<string> {
    const salt = await bcrypt.genSalt(10); // Numero di "rounds" di hashing
    return await bcrypt.hash(password, salt);
  }

  static async comparePassword(password:string, cryptedPassword:string ):Promise<boolean> {
    const isValid = await bcrypt.compare(password, cryptedPassword);
    if(!isValid) throw new Error("Password is not valid");
    return isValid;
  }
}

export default UserController;