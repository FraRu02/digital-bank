import { Response } from "express";
import { type AuthRequest } from "./AuthController";
import HolderModel from "@/models/HolderModel";
import UserModel from "@/models/UserModel";
import { type GetRequest } from "@/schemas/CardSchema";
import { type DeleteRequest } from "@/schemas/HolderSchema";

abstract class HolderController {

  static async getMe(req:AuthRequest, res:Response) {
    try {
      const user = req.user!;
      const holders = await UserModel.getInstance().getById(user.id, {holders: 1});
      const populated = await holders.populate("holders");
      res.status(200).send(populated.holders)
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async get(req:GetRequest, res:Response) {
    try {
      const {id} = req.params;
      if(id) {
        const holder = await HolderModel.getInstance().getById(id);
        res.status(200).send(holder);
      }else {
        const holders = await HolderModel.getInstance().getAll();
        res.status(200).send(holders);
      }
    } catch (error:any) {
      res.status(400).send(error.message)
    }
  }


  static async delete(req: DeleteRequest, res: Response) {
    try {
      const {holderIds} = req.body;
      await HolderModel.getInstance().deleteManyById(holderIds);
      res.status(200).send("Successfull deleted")
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }
}

export default HolderController;