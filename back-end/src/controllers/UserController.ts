/**
 * Controller per la gestione degli utenti.
 *
 * Questo controller fornisce:
 * - operazioni CRUD sugli utenti
 * - recupero dei conti bancari associati a un utente
 * - recupero delle transazioni recenti
 * - utility per hashing e verifica delle password
 *
 * Tutti i metodi sono statici e stateless.
 */

import { Response } from "express";
import UserModel from "../models/UserModel";
import { type AuthRequest } from "./AuthController";
import {
  DeleteRequest,
  GetTransactionsRequest,
  UpdateRequest,
  type GetBankAccountRequest,
  type GetRequest
} from "@/schemas/UserSchema";
import BankAccountModel from "@/models/BankAccountModel";
import TransactionModel from "@/models/TransactionModel";
import bcrypt from "bcrypt";

abstract class UserController {

  /**
   * Creazione di un nuovo utente.
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      const newUser = await UserModel.getInstance().create([req.body]);
      res.status(200).send(newUser);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }

  /**
   * Recupero utenti.
   *
   * - se l'id è presente restituisce il singolo utente
   * - altrimenti restituisce la lista completa
   */
  static async get(req: GetRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        const allUsers = await UserModel.getInstance().getAll();
        res.status(200).send(allUsers);
        return;
      } else {
        const user = await UserModel.getInstance().getById(id);
        res.status(200).send(user);
        return;
      }
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }

  /**
   * Recupero dei conti bancari associati a un utente.
   */
  static async getBankAccount(req: GetBankAccountRequest, res: Response) {
    try {
      const { id } = req.params;
      const accounts = await BankAccountModel
        .getInstance()
        .getMany({ userId: id });

      res.status(200).send(accounts);
      return;
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }

  /**
   * Recupero delle transazioni dell'utente negli ultimi 3 mesi.
   */
  static async getTransactions(req: GetTransactionsRequest, res: Response) {
    try {
      const { id } = req.params;

      // Calcolo della data limite (ultimi 3 mesi)
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getUTCMonth() - 3);

      const transactions = await TransactionModel
        .getInstance()
        .getByUserId(id, {
          createdAt: { $gte: cutoff }
        });

      res.status(200).send(transactions);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }

  /**
   * Aggiornamento massivo degli utenti tramite bulk write.
   */
  static async update(req: UpdateRequest, res: Response) {
    try {
      const users = await UserModel.getInstance().bulkWriteById(req.body);
      res.status(200).send(users);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }

  /**
   * Eliminazione di più utenti tramite array di identificativi.
   */
  static async delete(req: DeleteRequest, res: Response) {
    try {
      const { userIds } = req.body;
      await UserModel.getInstance().deleteManyById(userIds);
      res.status(200).send("Successfull deleted");
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  }

  /**
   * Generazione dell'hash della password.
   */
  static async cryptPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Confronto tra password in chiaro e password hashata.
   * Lancia un errore se la password non è valida.
   */
  static async comparePassword(
    password: string,
    cryptedPassword: string
  ): Promise<boolean> {
    const isValid = await bcrypt.compare(password, cryptedPassword);
    if (!isValid) throw new Error("Password is not valid");
    return isValid;
  }
}

export default UserController;