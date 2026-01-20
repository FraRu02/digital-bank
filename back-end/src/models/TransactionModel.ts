import mongoose, { Model, type CreateOptions, type FilterQuery, } from "mongoose";
import BankAccountModel from "@/models/BankAccountModel";
import BaseModel, { GetManyArgsProps, type CreateArgsProps } from "@/classes/BaseModel";
import CardModel from "@/models/CardModel";

export enum TransactionType {
  withdrawal = "withdrawal",
  transfer = "transfer",
  deposit = "deposit"
}

export enum TransactionStatus {
  completed = "completed", 
  failed = "failed"
}

const transactionSchema = new mongoose.Schema({
  sourceCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "card",
    required: true 
  },
  type: {
    type: String,
    enum: [TransactionType.transfer, TransactionType.deposit],
    required: [true, "Enter type"]
    // DEPOSITO, PRELIEVO, BONIFICO
  },
  import: {
    type: Number,
    required: [true, "Enter import"]
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.completed,
    required: true
  },
  sourceBankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "bankAccount" },
  destinationBankAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "bankAccount" },
  destinationCardId: { type: mongoose.Schema.Types.ObjectId, ref: "card"}
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret: Record<string, any>) {
      ret.id = ret._id;
      delete ret._id; 
      delete ret.__v; // Rimuove __v durante la conversione in JSON
      return ret;
    }
  }
});

const transactionModel = mongoose.model<any, Model<TransactionDocument>>("transaction", transactionSchema);
type PickRequiredNonNull<T, K extends keyof T> = { [P in K]-?: NonNullable<T[P]> };
type TransactionSchemaProps = mongoose.InferSchemaType<typeof transactionSchema>;
export type TransactionProps = TransactionSchemaProps & {id: string};
export type TransactionDocument = mongoose.HydratedDocument<TransactionSchemaProps>;
export type BaseTransactionProps = Omit<TransactionProps, "sourceBankAccountId"|"destinationBankAccountId"|"destinationCardId">;
export type BtoBTransactionProps = BaseTransactionProps & PickRequiredNonNull<TransactionProps, "sourceBankAccountId"|"destinationBankAccountId">;
export type BtoCTransactionProps = BaseTransactionProps & PickRequiredNonNull<TransactionProps, "sourceBankAccountId"|"destinationCardId">;
export type CtoBTransactionProps = BaseTransactionProps & PickRequiredNonNull<TransactionProps, "destinationBankAccountId">;
export type CtoCTransactionProps = BaseTransactionProps & PickRequiredNonNull<TransactionProps, "destinationCardId">;

type PickCreateProps<T extends TransactionProps> = Omit<T, "createdAt"|"updatedAt"|"status">

class TransactionModel extends BaseModel<TransactionDocument> {

  override async create(...args: CreateArgsProps<TransactionDocument>) {
    const [newDocuments, options] = args;
    const allPromises:any[] = [];
    const session = await mongoose.startSession();
    try {
     return await session.withTransaction(async() => {
        for (const transaction of newDocuments) {
          const type = transaction.type;
          const Import = transaction.import;
          if(!type) throw new Error("type is required");
          if(Import === null || Import === undefined) throw new Error("import is required");
          if (TransactionModel.isBtoBType(transaction)) {
            allPromises.push(this.createBtoB(transaction, {...options, session}));
          } else if (TransactionModel.isBtoCType(transaction)) {
            allPromises.push(this.createBtoC(transaction, {...options, session}));
          } else if (TransactionModel.isCtoBType(transaction)) {
            allPromises.push(this.createCtoB(transaction, {...options, session}));
          } else if (TransactionModel.isCtoCType(transaction)) {
            allPromises.push(this.createCtoC(transaction, {...options, session}));
          }
        }
        const createdTransactions = await super.create(...args);
        await Promise.all(allPromises);
        return createdTransactions;
      })  
    } catch (error) {
      console.log(error);
      throw error;
    }finally {
      await session.endSession();
    }
  };


  private async createBtoB(transaction:PickCreateProps<BtoBTransactionProps>, options?: CreateOptions):Promise<void> {
    const sourceBankAccountId = transaction.sourceBankAccountId?.toString();
    const destinationBankAccountId = transaction.destinationBankAccountId?.toString();
    const Import = transaction.import;
    if(!sourceBankAccountId) throw new Error("source bankAccountId is required");
    const sourceAccount = await BankAccountModel.getInstance().getById(sourceBankAccountId);
    if(!destinationBankAccountId) throw new Error("destination bankAccountId is required");
    const destinationAccount = await BankAccountModel.getInstance().getById(destinationBankAccountId);
    await BankAccountModel.getInstance().updateById(sourceBankAccountId, {balance: sourceAccount.balance-Import}, options);
    await BankAccountModel.getInstance().updateById(destinationBankAccountId, {balance: destinationAccount.balance+Import}, options);
  }

  private async createBtoC(transaction:TransactionProps, options?: CreateOptions):Promise<void>  {
    const sourceBankAccountId = transaction.sourceBankAccountId?.toString();
    const destinationCardId = transaction.destinationCardId?.toString();
    const Import = transaction.import;
    if(!sourceBankAccountId) throw new Error("source bankAccountId is required");
    const sourceAccount = await BankAccountModel.getInstance().getById(sourceBankAccountId);
    if(!destinationCardId) throw new Error("destination cardId is required");
    const destinationCard = await CardModel.getInstance().getById(destinationCardId);
    await BankAccountModel.getInstance().updateById(sourceBankAccountId, {balance: sourceAccount.balance-Import}, options);
    await CardModel.getInstance().updateById(destinationCardId, {balance: destinationCard.balance!+Import}, options);
  }

  private async createCtoB(transaction:PickCreateProps<CtoBTransactionProps>, options?: CreateOptions):Promise<void> {
    const sourceCardId = transaction.sourceCardId?.toString();
    const destinationBankAccountId = transaction.destinationBankAccountId?.toString();
    const Import = transaction.import;
    if(!sourceCardId) throw new Error("source cardId is required");
    const sourceCard = await CardModel.getInstance().getById(sourceCardId);
    if(!destinationBankAccountId) throw new Error("destination bankAccountId is required");
    const destinationAccount = await BankAccountModel.getInstance().getById(destinationBankAccountId);
    await CardModel.getInstance().updateById(sourceCardId, {balance: sourceCard.balance!-Import}, options);
    await BankAccountModel.getInstance().updateById(destinationBankAccountId, {balance: destinationAccount.balance+Import}, options);
  }

  private async createCtoC(transaction:PickCreateProps<CtoCTransactionProps>, options?: CreateOptions):Promise<void>{
    const sourceCardId = transaction.sourceCardId?.toString();
    const destinationCardId = transaction.destinationCardId?.toString();
    const Import = transaction.import;
    if(!sourceCardId) throw new Error("source cardId is required");
    const sourceCard = await CardModel.getInstance().getById(sourceCardId);
    if(!destinationCardId) throw new Error("destination cardId is required");
    const destinationCard = await CardModel.getInstance().getById(destinationCardId);
    await CardModel.getInstance().updateById(sourceCardId, {balance: sourceCard.balance!-Import}, options);
    await CardModel.getInstance().updateById(destinationCardId, {balance: destinationCard.balance!+Import}, options);
  }

  async getByUserId(userId:string, filter?: FilterQuery<TransactionDocument>) {
    try {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getUTCMonth() - 3);
      const userAccounts = await BankAccountModel.getInstance().getMany({userId});
      const userCards = await CardModel.getInstance().getMany({userId});
      const cardIds = userCards.map(acc => acc.id);
      const accountIds = userAccounts.map(acc => acc.id);
      return await this.model
        .find({
          $or: [
            { sourceCardId: { $in: cardIds } },
            { destinationCardId: { $in: cardIds } },
            { sourceBankAccountId : { $in: accountIds } },
            { destinationBankAccountId: { $in: accountIds } }
          ],
          ...filter
        }).sort({ createdAt: -1 })
    } catch (error:any) {
      console.error(error);
      throw error;
    }
  }

  async getByCardId(cardId:string[], ...args: GetManyArgsProps<TransactionDocument>) {
    try {
      const [filter, projection, options] = args;
      const cards = await CardModel.getInstance().getManyById(cardId);
      const bankAccountsId:string[] = [];
      cards.forEach((e) => {
        if(CardModel.isDebitType(e)) bankAccountsId.push(e.bankAccountId.toString());
      });
      return await this
        .getMany({
          $or: [
            { sourceCardId: { $in: cardId } },
            { destinationCardId: { $in: cardId } },
            { destinationBankAccountId: { $in: bankAccountsId } }
          ],
          ...filter,
        }, projection, options);
    } catch (error:any) {
      console.error(error);
      throw error;
    }
  }

  async getByBankAccountId(bankAccountId:string[], filter?:FilterQuery<TransactionProps>) {
    try {
      return await this.model
        .find({
          $or: [
            { sourceBankAccountId: { $in: bankAccountId } },
            { destinationBankAccountId: { $in: bankAccountId } }
          ],
          ...filter
        })
        .sort({ createdAt: -1 })
    } catch (error:any) {
      console.error(error);
      throw error;
    }
  }

  static isBtoBType(transaction: any): transaction is BtoBTransactionProps {
    return transaction.sourceBankAccountId && transaction.destinationBankAccountId;
  }

  static isBtoCType(transaction: any): transaction is BtoCTransactionProps {
    return transaction.sourceBankAccountId && transaction.destinationCardId;
  }

  static isCtoBType(transaction: any): transaction is CtoBTransactionProps {
    return transaction.destinationBankAccountId;
  }

  static isCtoCType(transaction: any): transaction is CtoCTransactionProps {
    return transaction.destinationCardId;
  }
}
TransactionModel.getInstance(transactionModel);
export default TransactionModel;