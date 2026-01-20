import server from "@/src/axiosConfig";
import Utilities from "./Utilities";
import type { HolderProps } from "./Holder";

type CreateHolderProps = Omit<HolderProps, "createdAt"|"updatedAt">;

type CreateCardProps = {
  holder: CreateHolderProps;
  type: CardType.debit;
  bankAccountId: string;
} | {
  holder: CreateHolderProps;
  type: CardType.prepaid;
}

abstract class Card {

  static async create(data: CreateCardProps):Promise<BaseCardProps> {
    await Utilities.sleep(1000);
    return await server.post("/cards/me", {
      ...data
    }).then((res) => res.data);
  }

  static async getAll():Promise<BaseCardProps[]> {
    await Utilities.sleep(1000);
    return await server.get("/cards").then((res) => res.data);
  }

  static async getMe():Promise<BaseCardProps[]> {
    await Utilities.sleep(1000);
    return await server.get("/cards/me").then((res) => res.data?.reverse?.());
  }

  static async getMeById(id: string):Promise<BaseCardProps> {
    await Utilities.sleep(1000);
    return await server.get(`/cards/me/${id}`).then((res) => res.data);
  }

  static async getMeIncExp(id: string):Promise<{inc: number, exp: number}> {
    await Utilities.sleep(1000);
    return await server.get(`/cards/me/${id}/incExp`).then((res) => res.data);
  }

  static async getByBankAccountId(bankAccountId: string):Promise<Array<BaseCardProps>> {
    return await server.get("/cards/me", {params: {bankAccountId}}).then((res) => res.data);
  }

  static async delete(id: string|string[]):Promise<void> {
    await Utilities.sleep(1000);
    return await server.delete("/cards", {data: {
      cardIds: Array.isArray(id)? id : [id]
    }}).then((res) => res.data);
  }


  static isDebitType(card: any): card is DebitCardProps {
    return card.bankAccountId && card.type === CardType.debit;
  }

  static isPrepaidType(card: any): card is PrepaidCardProps {
    return !Number.isNaN(card.balance) && card.type === CardType.prepaid;
  }

}

export type BaseCardProps = {
  id: string;
  userId: string;
  number: string;
  type: CardType;
  expire: string;
  cvv: string;
  holderId?: string;
  status: CardStatus;
}

export type DebitCardProps = Omit<BaseCardProps, "type"> & { type: CardType.debit, bankAccountId: string };
export type PrepaidCardProps = Omit<BaseCardProps, "type"> & { type: CardType.prepaid, balance: number };

export enum CardType {
  debit = "debit",
  prepaid = "prepaid"
}

export enum CardStatus {
  active = "active",
  inactive = "inactive",
  blocked = "blocked",
  expired = "expired",
  replaced = "replaced",
  cancelled = "cancelled"
}


export default Card;