/**
 * Controller per la gestione degli intestatari (Holder).
 *
 * Fornisce operazioni:
 * - recupero intestatari dell'utente loggato o globali
 * - recupero di un singolo intestatario tramite ID
 * - cancellazione di più intestatari tramite array di ID
 *
 * Tutti i metodi sono statici e stateless.
 */

import { Response } from "express";
import HolderModel, { HolderStatus } from "@/models/HolderModel";
import UserModel from "@/models/UserModel";
import { type GetRequest } from "@/schemas/CardSchema";
import { type GetMeRequest, type DeleteRequest } from "@/schemas/HolderSchema";

abstract class HolderController {

  /**
   * Recupera gli intestatari dell'utente loggato
   * - Se id è presente, restituisce il singolo intestatario
   * - Altrimenti restituisce tutti gli intestatari attivi dell'utente
   */
  static async getMe(req:GetMeRequest, res:Response) {
    try {
      const {id} = req.params;
      const user = req.user!;

      if(id) {
        // Recupero intestatario specifico
        const holder = await HolderModel.getInstance().getById(id);
        res.status(200).send(holder);
      } else {
        // Recupero tutti gli intestatari attivi dell'utente
        const holders = await UserModel.getInstance().getOne({_id: user.id}, {holders: 1});
        const populated = await holders.populate({
          path: "holders",
          match: { status: HolderStatus.active } // Solo intestatari attivi
        });
        res.status(200).send(populated.holders)
      }

    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  /**
   * Recupero intestatari globali o singolo
   * - Se id è presente, restituisce il singolo intestatario
   * - Altrimenti restituisce tutti gli intestatari
   */
  static async get(req:GetRequest, res:Response) {
    try {
      const {id} = req.params;

      if(id) {
        const holder = await HolderModel.getInstance().getById(id);
        res.status(200).send(holder);
      } else {
        const holders = await HolderModel.getInstance().getAll();
        res.status(200).send(holders);
      }

    } catch (error:any) {
      res.status(400).send(error.message)
    }
  }

  /**
   * Eliminazione di più intestatari tramite array di ID
   */
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