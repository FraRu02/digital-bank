import { Response } from "express";
import CardModel, { CardDocument, CardStatus, CardType } from "@/models/CardModel";
import { type CreateRequest, type GetRequest, type GetMeRequest, GetIncExpRequest, type DeleteRequest, type VerifyOtpRequest, type ResendOtpRequest } from "@/schemas/CardSchema";
import HolderModel, { HolderStatus, type HolderDocument } from "@/models/HolderModel";
import BankAccountModel, { BankAccountStatus } from "@/models/BankAccountModel";
import TransactionModel from "@/models/TransactionModel";
import UserModel from "@/models/UserModel";
import crypto from 'crypto';
import Utilities from "@/classes/Utilities";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Otp from "@/classes/Otp";
import ResendEmail from "@/classes/ResendEmail";

abstract class CardController {

  static async create(req:CreateRequest, res:Response) {
    try {
      
      const user = req.user!;
      const {holder:reqHolder, type} = req.body;
      await Utilities.followSession(null, async(session) => {
        let holder!:HolderDocument;
        const foundedHolder = await HolderModel.getInstance().getOne({taxCode: reqHolder.taxCode}).catch(() => null);
        if(!foundedHolder) holder = await HolderModel.getInstance().create([reqHolder as any], {session}).then((res) => res[0]);
        else holder = foundedHolder;
        await UserModel.getInstance().updateById(user.id, {
          $addToSet: { holders: holder.id },
        }, {session})
        let newCard!:CardDocument;
        const otp = await Otp.generate();
        if(type === CardType.debit) {
          const bankAccountId = req.body.bankAccountId;
          const bankAccount = await BankAccountModel.getInstance().getById(bankAccountId);
          if(bankAccount.userId.toString() !== req.user?.id) throw new Error("You are not the owner of this bankAccount");
          if(bankAccount.status !== BankAccountStatus.active) throw new Error("This bankAccount is not active");
          const bankAccountCards = await CardModel.getInstance().getMany({bankAccountId});
          if(bankAccountCards.length >= 4) throw new Error("Maximum 4 cards per bank account");
          newCard = await CardModel.getInstance().create([{
            userId: req.user!.id as any,
            bankAccountId: bankAccount.id,
            holderId: holder.id,
            number: CardController.generateCardNumber(),
            type: CardType.debit,
            expire: new Date(new Date().valueOf()+3600*24*265*4*1000),
            cvv: CardController.generateCVV(),
            otpCodeHash: otp.otpCodeHash,
            otpExpiresAt: otp.otpExpiresAt,
            otpAttempts: otp.otpAttempts
          }], {session}).then(res => res[0]);
          res.status(200).send(newCard);
        }else if(type === CardType.prepaid) {
          const userPrepaidCards = await CardModel.getInstance().getMany({userId: user.id, type: CardType.prepaid});
          if(userPrepaidCards.length >= 4) throw new Error("Maximum 4 prepaid cards");
          newCard = await CardModel.getInstance().create([{
            userId: req.user!.id as any,
            balance: 0,
            holderId: holder.id,
            number: CardController.generateCardNumber(),
            type: CardType.prepaid,
            expire: new Date(new Date().valueOf()+3600*24*265*4*1000),
            cvv: CardController.generateCVV(),
            otpCodeHash: otp.otpCodeHash,
            otpExpiresAt: otp.otpExpiresAt,
            otpAttempts: otp.otpAttempts
          }], {session}).then(res => res[0]);
        }
        await ResendEmail.getInstance().sendEmail({
          to: holder.email,
          subject: 'Verifica carta',
          html: `Il tuo codice di verifica è: <strong>${otp.otp}</strong>`,
        });
        res.status(200).send({...newCard.toJSON(), cvv: undefined, expire: undefined, number: undefined, balance: undefined});
      });
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }
  
  static async getMe(req:GetMeRequest, res:Response) {
    try {
      const {id} = req.params;
      if(id) {
        let card = await CardModel.getInstance().getById(id, null, {select: "+otpExpiresAt +otpAttempts"});
        if(card.userId.toString() !== req.user!.id) return res.status(401).send("This card is not yours");
        if (card.status === CardStatus.pending_verification) {
          card = {...card.toJSON(), cvv: undefined, expire: undefined, number: undefined, balance: undefined} as any
        }else card = {...card.toJSON(), otpExpiresAt: undefined, otpAttempts: undefined} as any;
        res.status(200).send(card);
      }else {
        const {bankAccountId} = req.query;
        let cards;
        if(bankAccountId) {
          cards = await CardModel.getInstance().getMany({userId: req.user!.id, bankAccountId}, null, {select: "+otpExpiresAt +otpAttempts"});
        }else {
          cards = await CardModel.getInstance().getMany({userId: req.user!.id}, null, {select: "+otpExpiresAt +otpAttempts"});
        }
        const formatted = cards.map(element => {
          if (element.status === CardStatus.pending_verification) {
            return {...element.toJSON(), cvv: undefined, expire: undefined, number: undefined, balance: undefined};
          }
          return {...element.toJSON(), otpExpiresAt: undefined, otpAttempts: undefined};
        });
        res.status(200).send(formatted);
      }
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async get(req:GetRequest, res:Response) {
    try {
      const {id} = req.params;
      if(id) {
        const bankAccount = await CardModel.getInstance().getById(id);
        res.status(200).send(bankAccount);
      }else {
        const bankAccounts = await CardModel.getInstance().getAll();
        res.status(200).send(bankAccounts);
      }
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }


  static async getIncAndExp(req:GetIncExpRequest, res:Response) {
    try {
      const {id} = req.params;
      const card = await CardModel.getInstance().getById(id);
      if(card.userId.toString() !== req.user!.id) return res.status(401).send("This card is not yours");
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const transactions = await TransactionModel.getInstance().getByCardId([id], {
        createdAt: { $gte: startOfYear },
      });
      const incExp = {inc: 0, exp: 0};
      transactions.forEach((element) => {
        if(CardModel.isDebitType(card)) {
          if(TransactionModel.isBtoBType(element)) {
            if(element.sourceBankAccountId.toString() === card.bankAccountId.toString()) incExp.exp += element.import;
            else incExp.inc += element.import;
          }else if(TransactionModel.isBtoCType(element)) {
            if(element.sourceBankAccountId.toString() === card.bankAccountId.toString()) incExp.exp += element.import;
          }else if(TransactionModel.isCtoBType(element)) {
            if(element.destinationBankAccountId.toString() === card.bankAccountId.toString()) incExp.inc += element.import;
          }
        }else if(CardModel.isPrepaidType(card)) {
          if(TransactionModel.isCtoCType(element)) {
            if(element.sourceCardId.toString() === card.id) incExp.exp += element.import;
            else incExp.inc += element.import;
          }else if(TransactionModel.isCtoBType(element)) {
            if(element.sourceCardId.toString() === card.id) incExp.exp += element.import;
          }else if(TransactionModel.isBtoCType(element)) {
            if(element.destinationCardId.toString() === card.id) incExp.inc += element.import;
          }
        }
       
      });
      res.status(200).send(incExp);
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async delete(req:DeleteRequest, res:Response) {
    try {
      const cardIds = req.body.cardIds;
      await CardModel.getInstance().deleteManyById(cardIds);
      res.status(200).send("Successfull deleted");
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async verifyOtp(req:VerifyOtpRequest, res:Response) {
    try {
      const user = req.user!;
      const {cardId, code:otpCode} = req.body;
      const card = await CardModel.getInstance().getById(cardId, null, {select: "+otpCodeHash +otpExpiresAt +otpAttempts"});
      if(card.userId.toString() !== user.id) throw new Error("You are not the owner of this card");
      if(card.otpExpiresAt < new Date()) throw new Error("OTP expired");
      if(card.otpAttempts! >= 5) throw new Error("Too many attempts");

      const valid = await bcrypt.compare(otpCode, card.otpCodeHash);

      if (!valid) {
        card.otpAttempts! += 1;
        await card.save();
        throw new Error("Incorrect OTP" );
      }
      await Utilities.followSession(null, async(session) => {
        card.status = CardStatus.active;
        await card.save({session});
        await HolderModel.getInstance().updateById(card.holderId.toString(), {status: HolderStatus.active}, {session});
        if(CardModel.isDebitType(card)) {
          const bankAccount = await BankAccountModel.getInstance().getById(card.bankAccountId!.toString());
          if(bankAccount.status === BankAccountStatus.pending_verification) {
            bankAccount.status = BankAccountStatus.active;
            await bankAccount.save({session});
          }
        }
      });
      res.status(200).send({...card.toJSON(), otpAttempts: undefined, otpCodeHash: undefined, otpExpiresAt: undefined});
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

  static async resendOtp(req:ResendOtpRequest, res:Response) {
    try {
      const {cardId} = req.body;
      const user = req.user!;
      const card = await CardModel.getInstance().getById(cardId);
      if(card.userId.toString() !== user.id) throw new Error("You are not the owner of this card");
      const holder = await HolderModel.getInstance().getById(card.holderId.toString());
      const newOtp = await Otp.generate();
      card.otpCodeHash = newOtp.otpCodeHash;
      card.otpExpiresAt = newOtp.otpExpiresAt;
      card.otpAttempts = newOtp.otpAttempts;
      const updatedCard = await card.save();
      await ResendEmail.getInstance().sendEmail({
        to: holder.email,
        subject: 'Verifica email',
        html: `Il tuo codice di verifica è: <strong>${newOtp.otp}</strong>`,
      });
      return res.status(200).send({...updatedCard.toJSON(), cvv: undefined, expire: undefined, number: undefined, balance: undefined, otpCodeHash: undefined});
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }
  

  static generateCardNumber(prefix = "4"):string {
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

  static generateCVV():string {
    const cvv = crypto.randomInt(0, 1000);
    return cvv.toString().padStart(3, '0');
  }
}

export default CardController;