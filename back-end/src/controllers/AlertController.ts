import { Response } from "express";
import { type AuthRequest } from "./AuthController";
import { type DeleteRequest } from "@/schemas/AlertSchema";
import AlertModel from "@/models/AlertModel";

abstract class AlertController {
  static async getMe(req:AuthRequest, res:Response) {
    try {
      const user = req.user!;
      const alerts = await AlertModel.getInstance().getMany({userId: user.id});
      res.status(200).send(alerts)
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }


  static async deleteMe(req: DeleteRequest, res: Response) {
    try {
      const {alertIds} = req.body;
      const user = req.user!;
      if(alertIds.length > 0) {
        const alerts = await AlertModel.getInstance().getManyById(alertIds);
        for(const element of alerts) {
          if(element.userId.toString() !== user.id) return res.status(401).send(`Alert with id ${element.id} is not yours`);
        }
        await AlertModel.getInstance().deleteManyById(alertIds)
      }else await AlertModel.getInstance().deleteMany({userId: user.id});
      res.status(200).send("Successfull deleted")
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }
}

export default AlertController;