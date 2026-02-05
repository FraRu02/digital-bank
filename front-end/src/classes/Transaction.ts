import server from "@/src/axiosConfig";
import Utilities from "./Utilities";
import type { UserProps } from "./User";

type CreateTransactionParams =
| { sourceCardId: string; import: number; destinationCardNumber: string }
| { sourceCardId: string; import: number; destinationIban: string };
abstract class Transaction {

  static async getAll():Promise<BaseTransactionProps[]> {
    return await server.get("/transactions").then((res) => res.data);
  }

  static async create(params: CreateTransactionParams):Promise<BaseTransactionProps[]> {
    return await server.post("/transactions", {
      ...params,
      type: TransactionType.transfer
    }).then((res) => res.data);
  }

  static async getByBankAccountId(bankAccountId:string):Promise<BaseTransactionProps[]> {
    return await server.get("/transactions/me", {
      params: {
        bankAccountId
      }
    }).then((res) => res.data);
  }

  static async getByCardId(cardId:string):Promise<BaseTransactionProps[]> {
    return await server.get("/transactions/me", {
      params: {
        cardId
      }
    }).then((res) => res.data);
  }

  static async delete(id: string|string[]): Promise<void> {
    return await server.delete("/transactions", {data: {
      transactionIds: Array.isArray(id) ? id : [id]
    }}).then((res) => res.data);
  }
}

export type BaseTransactionProps = {
  id: string;
  sourceCardId: string;
  type: TransactionType.transfer | TransactionType.deposit;
  import: number;
  description?: string | null | undefined;
  status: TransactionStatus;
  sender?: Pick<UserProps, "name"|"lastname">
  beneficiary?: Pick<UserProps, "name"|"lastname">
  createdAt: string;
  updatedAt: string;
}
export type BtoBTransactionProps = BaseTransactionProps & {sourceBankAccountId: string; destinationBankAccountId: string;};
export type BtoCTransactionProps = BaseTransactionProps & {sourceBankAccountId: string; destinationCardId: string;};
export type CtoBTransactionProps = BaseTransactionProps & {destinationBankAccountId: string;};
export type CtoCTransactionProps = BaseTransactionProps & {destinationCardId: string; };

export enum TransactionType {
  withdrawal = "withdrawal",
  transfer = "transfer",
  deposit = "deposit"
}

export enum TransactionStatus {
  completed = "completed", 
  failed = "failed"
}


export default Transaction;