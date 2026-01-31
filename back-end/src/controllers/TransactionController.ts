import { Response } from "express";
import TransactionModel, { TransactionDocument, TransactionType } from "@/models/TransactionModel";
import { type GetMeRequest, type GetRequest, type CreateRequest, DeleteRequest } from "@/schemas/TransactionSchema";
import BankAccountModel, { BankAccountStatus } from "@/models/BankAccountModel";
import CardModel, { CardStatus, CardType } from "@/models/CardModel";
import { getIO } from "@/server/SocketIOServer";
import AlertModel from "@/models/AlertModel";
import { UserProps } from "@/models/UserModel";


abstract class TransactionController {

  static async create(req:CreateRequest, res:Response) {
    const {sourceCardNumber, type, import:Import, description} = req.body;
    try {
      const sourceCard = await CardModel.getInstance().getOne({number: sourceCardNumber});
      if(sourceCard.userId.toString() !== req.user!.id) throw new Error("You are not the owner of this card");
      if(sourceCard.status !== CardStatus.active) throw new Error("Source card is not active");
      let newTransaction:TransactionDocument[], destinationUser:UserProps;
      if(type===TransactionType.transfer) {
        const {destinationIban, destinationCardNumber} = req.body;
        if(CardModel.isDebitType(sourceCard)) {
          const {bankAccountId} = sourceCard;
          const sourceAccount = await BankAccountModel.getInstance().getById(bankAccountId.toString());
          if(sourceAccount.status !== BankAccountStatus.active) throw new Error("Source bankAccount is not active");
          if(sourceAccount.balance - Import < 0) throw new Error("You don't have enough money");
          if(destinationIban) { // BtoB
            const destinationAccount = await (await BankAccountModel.getInstance().getOne({iban: destinationIban})).populate("userId", ["id", "name", "lastname"]);
            destinationUser = destinationAccount.userId as any;
            if(destinationAccount.status !== BankAccountStatus.active) throw new Error("Destination bankAccount is not active");
            if(sourceAccount.id === destinationAccount.id) throw new Error("You can't transfer money to the same account");
            newTransaction = await TransactionModel.getInstance().create([{
              sourceCardId: sourceCard.id,
              sourceBankAccountId: sourceAccount.id,
              destinationBankAccountId: destinationAccount.id,
              import: Import,
              type,
              description: req.body.description
            }]);
          }else if(destinationCardNumber) { // BtoC
            const destinationCard = await (await CardModel.getInstance().getOne({number: destinationCardNumber})).populate("userId", ["id", "name", "lastname"]);
            if(destinationCard.status !== CardStatus.active) throw new Error("Destination card is not active");
            if(destinationCard.type === CardType.debit) throw new Error("You can't transfer money to a debit card");
            destinationUser = destinationCard.userId as any;
            newTransaction = await TransactionModel.getInstance().create([{
              sourceCardId: sourceCard.id,
              sourceBankAccountId: sourceAccount.id,
              destinationCardId: destinationCard.id,
              import: Import,
              type,
              description: req.body.description
            }]);
          }
        }else if(CardModel.isPrepaidType(sourceCard)) {
          if(sourceCard.balance - Import < 0) throw new Error("You don't have enough money");
          if(destinationIban) { // CtoB
            const destinationAccount = await (await BankAccountModel.getInstance().getOne({iban: destinationIban})).populate("userId", ["id", "name", "lastname"]);
            if(destinationAccount.status !== BankAccountStatus.active) throw new Error("Destination bankAccount is not active");
            destinationUser = destinationAccount.userId as any;
            newTransaction = await TransactionModel.getInstance().create([{
              sourceCardId: sourceCard.id,
              destinationBankAccountId: destinationAccount.id,
              import: Import,
              type,
              description: req.body.description
            }]);
          }else if(destinationCardNumber) { // CtoC
            const destinationCard = await (await CardModel.getInstance().getOne({number: destinationCardNumber})).populate("userId", ["id", "name", "lastname"]);
            if(destinationCard.status !== CardStatus.active) throw new Error("Destination card is not active");
            if(destinationCard.type === CardType.debit) throw new Error("You can't transfer money to a debit card");
            if(sourceCard.id === destinationCard.id) throw new Error("You can't transfer money to the same card");
            destinationUser = destinationCard.userId as any;
            newTransaction = await TransactionModel.getInstance().create([{
              sourceCardId: sourceCard.id,
              destinationCardId: destinationCard.id,
              import: Import,
              type,
              description: req.body.description,
            }]);
          }
        }    
      }else if(type === TransactionType.withdrawal) {
        // const {cardId} = req.body;
        res.status(200).send("withdrawal");
      }
      const populatedTransaction = [{
        ...newTransaction![0].toJSON(),
        sender: {name: req.user!.name, lastname: req.user!.lastname},
        beneficiary: {name: destinationUser!.name, lastname: destinationUser!.lastname},
      }];
      res.status(200).send(populatedTransaction);
      const newAlert = await AlertModel.getInstance().create([{
        userId: destinationUser!.id.toString() as any,
        title: "Nuova entrata",
        content: `Hai ricevuto ${Import}€ da ${req.user!.name} ${req.user!.lastname}`,
        senderDescription: description,
      }])
      if(req.user?.id !== destinationUser!.id.toString()) {
        getIO().to(`user:${destinationUser!.id.toString()}`).emit("new-transaction", newAlert[0]);
      }
    } catch (error:any) {
      res.status(400).send(error.message)
    }
  }
  
  static async getMe(req:GetMeRequest, res:Response) {
    try {
      const {id} = req.params;
      if(id) {
        const transaction = await TransactionModel.getInstance().getById(id);
        // const {json} = await BtoBTransactionModel.defaultPopulate(transaction);
        // if(json.sourceBankAccount.userId.toString() !== req.user!.id 
        //   && json.destinationBankAccount.userId.toString() !== req.user!.id) {
        //     res.sendStatus(401);
        //     return;
        // }
        res.status(200).send(transaction);
      }else {
        const {cardId} = req.query; 
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getUTCMonth() - 3);
        if(cardId) {
          const card = await CardModel.getInstance().getById(cardId);
          if(card.userId.toString() !== req.user!.id) return res.status(401).send("This card is not yours");
          const transactions = await TransactionModel.getInstance().getByCardId([cardId], {
            createdAt: { $gte: cutoff },
          });
          const populatedTransactions = [];
          for(let i =0; i<transactions.length; i++) {
            const sourceCard = await CardModel.getInstance().getById(transactions[i].sourceCardId.toString());
            let beneficiary;
            if(transactions[i].destinationBankAccountId) {
              const destinationBankAccount = await BankAccountModel.getInstance().getById(transactions[i].destinationBankAccountId!.toString()); 
              const populatedBankAccount = await destinationBankAccount.populate("userId", ["name", "lastname"]);
              beneficiary = populatedBankAccount.userId;
            }else if(transactions[i].destinationCardId) {
              const destinationCard = await CardModel.getInstance().getById(transactions[i].destinationCardId!.toString()); 
              const populatedCard = await destinationCard.populate("userId", ["name", "lastname"]);
              beneficiary = populatedCard.userId;
            }
            const populatedSourceCard = await sourceCard.populate("userId", ["name", "lastname"]);
            populatedTransactions.push({
              ...transactions[i].toJSON(),
              sender: populatedSourceCard.userId,
              beneficiary
            });
          }
          res.status(200).send(populatedTransactions);
        }else {
          const transactions = await TransactionModel.getInstance().getByUserId(req.user!.id, {
            createdAt: { $gte: cutoff },
          })
          res.status(200).send(transactions);
        }
      }
    } catch (error:any) {
      res.status(400).send(error.message)
    }
  }

  static async get(req:GetRequest, res:Response) {
    try {
      const {id} = req.params;
      if(id) {
        const transaction = await TransactionModel.getInstance().getById(id);
        res.status(200).send(transaction);
      }else {
        const transactions = await TransactionModel.getInstance().getAll();
        res.status(200).send(transactions);
      }
    } catch (error:any) {
      res.status(400).send(error.message)
    }
  }

  static async delete(req: DeleteRequest, res: Response) {
    try {
      const {transactionIds} = req.body;
      await TransactionModel.getInstance().deleteManyById(transactionIds);
      res.status(200).send("Successfull deleted")
    } catch (error:any) {
      res.status(400).send(error.message);
    }
  }

}

export default TransactionController;