import { Response } from "express";
import BankAccountModel, { BankAccountStatus } from "@/models/BankAccountModel";
import mongoose from "mongoose";
import CardModel, { CardStatus, CardType } from "@/models/CardModel";
import CardController from "./CardController";
import UserModel, { UserRole } from "@/models/UserModel";
import { GetIncExpRequest, type GetMeRequest, type CloseRequest, type DeleteRequest, type CreateRequest } from "@/schemas/BankAccountSchema";
import { hasUserPermissions } from "@/middleware/UtilitiesMiddleware";
import TransactionModel from "@/models/TransactionModel";
import HolderModel, { HolderDocument } from "@/models/HolderModel";
import Utilities from "@/classes/Utilities";
import Otp from "@/classes/Otp";
import ResendEmail from "@/classes/ResendEmail";

abstract class BankAccountController {

  static async create(req:CreateRequest, res:Response) {
    try {
      const {holder:reqHolder} = req.body;
      const user = req.user!;
      await Utilities.followSession(null, async(session) => {
        const userBankAccounts = await BankAccountModel.getInstance().getMany({userId: user.id}, null);
        if(userBankAccounts.length >= 3) throw new Error("Maximum 3 bank accounts per user");
        let holder:HolderDocument;
        const foundedHolder = await HolderModel.getInstance().getOne({taxCode: reqHolder.taxCode}).catch(() => null);
        if(!foundedHolder) holder = await HolderModel.getInstance().create([reqHolder as any], {session}).then((res) => res[0]);
        else holder = foundedHolder;
        await UserModel.getInstance().updateById(user.id, {
          $addToSet: { holders: holder.id },
        }, {session})
        const iban = BankAccountController.generateIBAN();
        const otp = await Otp.generate();
        const newBankAccount = await BankAccountModel.getInstance().create([{
          userId: req.user?.id as any,
          iban,
          holderId: holder.id,
          otpCodeHash: otp.otpCodeHash,
          otpExpiresAt: otp.otpExpiresAt,
          otpAttempts: otp.otpAttempts
        }], {session}).then((res) => res[0]);
        await CardModel.getInstance().create([{
          userId: req.user!.id as any,
          holderId: holder.id,
          bankAccountId: newBankAccount.id,
          number: CardController.generateCardNumber(),
          type: CardType.debit,
          expire: new Date(new Date().valueOf()+3600*24*265*4*1000),
          cvv: CardController.generateCVV(),
          otpCodeHash: otp.otpCodeHash,
          otpExpiresAt: otp.otpExpiresAt,
          otpAttempts: otp.otpAttempts
        }], {session})
        await ResendEmail.getInstance().sendEmail({
          to: holder.email,
          subject: 'Verifica conto bancario',
          html: `Il tuo codice di verifica è: <strong>${otp.otp}</strong>`,
        });
        res.status(200).send({...newBankAccount.toJSON(), iban: undefined, balance: undefined});
      });
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async getMe(req:GetMeRequest, res:Response) {
    try {
      const {id} = req.params;
      if(id) {
        let bankAccount = await BankAccountModel.getInstance().getById(id, null, {select: "+otpExpiresAt +otpAttempts"});
        if(bankAccount.userId.toString() !== req.user!.id) return res.status(401).send("This bank account is not yours");
        if (bankAccount.status === BankAccountStatus.pending_verification) {
          bankAccount = {...bankAccount.toJSON(), iban: undefined, balance: undefined} as any
        }else bankAccount = {...bankAccount.toJSON(), otpExpiresAt: undefined, otpAttempts: undefined} as any;
        res.status(200).send(bankAccount);
      }else {
        const bankAccounts = await BankAccountModel.getInstance().getMany({userId: req.user!.id});
        const formatted = bankAccounts.map(element => {
          if (element.status === BankAccountStatus.pending_verification) {
            return{...element.toJSON(), iban: undefined, balance: undefined};
          }
          return{...element.toJSON(), otpExpiresAt: undefined, otpAttempts: undefined};
        });
        res.status(200).send(formatted);
      }
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async get(req:GetMeRequest, res:Response) {
    try {
      const {id} = req.params;
      if(id) {
        const bankAccount = await BankAccountModel.getInstance().getById(id);
        res.status(200).send(bankAccount);
      }else {
        const bankAccounts = await BankAccountModel.getInstance().getAll();
        res.status(200).send(bankAccounts);
      }
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async getIncAndExp(req:GetIncExpRequest, res:Response) {
    try {
      const {id} = req.params;
      const bankAccount = await BankAccountModel.getInstance().getById(id);
      if(bankAccount.userId.toString() !== req.user!.id) return res.status(401).send("This bank account is not yours");
      const now = new Date();
      // const startOfYear = new Date(now.getFullYear(), 0, 1);
      const startOfMonth = new Date(now).setDate(1);
      const transactions = await TransactionModel.getInstance().getByBankAccountId([id], {
        createdAt: { $gte: startOfMonth },
      })

      const incExp = {inc: 0, exp: 0};

      transactions.forEach((element) => {
        if(TransactionModel.isBtoBType(element)) {
          if(element.sourceBankAccountId.toString() === id) incExp.exp += element.import;
          else incExp.inc += element.import;
        }else if(TransactionModel.isBtoCType(element)) {
          if(element.sourceBankAccountId.toString() === id) incExp.exp += element.import;
          else incExp.inc += element.import;
        }else if(TransactionModel.isCtoBType(element)) {
          if(element.destinationBankAccountId.toString() === id) incExp.inc += element.import;
          else incExp.exp += element.import;
        }
      });
      res.status(200).send(incExp);
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async close(req:CloseRequest, res:Response) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async() => {
        const {id} = req.params;
        const user = req.user!;
        const bankAccount = await BankAccountModel.getInstance().getById(id);
        if(bankAccount.userId !== user.id) {
          await hasUserPermissions([UserRole.admin])(req, res);
        }
        const updatedBankAccount = await BankAccountModel.getInstance().updateById(id, {
          status: BankAccountStatus.closed
        }, {session});
        await CardModel.getInstance().updateMany({
          bankAccountId: id,
        },
        {
          status: CardStatus.inactive
        }, {session}
        );
        res.status(200).send(updatedBankAccount);
      })
    } catch (error:any) {
      console.error(error)
      res.status(400).send(error.message);
    }finally {
      await session.endSession();
    }
  }

  static async delete(req:DeleteRequest, res:Response) {
    try {
      const accountIds = req.body.bankAccountIds;
      await BankAccountModel.getInstance().deleteManyById(accountIds);
      res.status(200).send("Successfull deleted");
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static generateCreditCardNumber(prefix = "4"):string {
    let ccNumber = prefix;

    // genera le prime 15 cifre (senza il check digit)
    while (ccNumber.length < 15) {
      ccNumber += Math.floor(Math.random() * 10);
    }

    // calcola check digit con algoritmo di Luhn
    const digits = ccNumber.split("").map(Number).reverse();
    const sum = digits.reduce((acc, d, i) => {
      if (i % 2 === 0) {
        let dbl = d * 2;
        if (dbl > 9) dbl -= 9;
        return acc + dbl;
      }
      return acc + d;
    }, 0);

    const checkDigit = (10 - (sum % 10)) % 10;
    return ccNumber + checkDigit;
  }


  static generateIBAN(countryCode:string = "IT"):string {
    // BBAN (Basic Bank Account Number) fittizio: 23 cifre numeriche
    const bban = Array.from({ length: 23 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");

    // Checksum semplificato (non ufficiale)
    const checksum = String(Math.floor(Math.random() * 90) + 10); // 10-99

    return `${countryCode}${checksum}${bban}`;
  }

}

export default BankAccountController;