import server from "@/src/axiosConfig";
import Utilities from "./Utilities";
import type { HolderProps } from "./Holder";

abstract class BankAccount {

  static async getAll():Promise<BankAccountProps[]> {
    await Utilities.sleep(1000);
    return await server.get("/bankAccounts").then((res) => res.data);
  }

  static async getMe():Promise<Array<BankAccountProps>> {
    await Utilities.sleep(1000);
    return await server.get("/bankAccounts/me").then((res) => res.data);
  }

  static async getMeById(id: string):Promise<BankAccountProps> {
    await Utilities.sleep(1000);
    return await server.get(`/bankAccounts/me/${id}`).then((res) => res.data);
  }

  static async getMeIncExp(id: string):Promise<{inc: number, exp: number}> {
    await Utilities.sleep(1000);
    return await server.get(`/bankAccounts/me/${id}/incExp`).then((res) => res.data);
  }

  static async create(data:{holder: HolderProps}):Promise<BankAccountProps> {
    await Utilities.sleep(1000);
    return await server.post("/bankAccounts/me", {
      ...data
    }).then((res) => res.data);
  }

  static async delete(id: string|string[]):Promise<void> {
    await Utilities.sleep(1000);
    return await server.delete("/bankAccounts", {data: {
      bankAccountIds: Array.isArray(id)? id : [id]
    }}).then((res) => res.data);
  }

}

export type BankAccountProps = {
  id: string;
  userId: string;
  status: BankAccountStatus;
  iban: string;
  balance: number;
  currency: string;
}

export enum BankAccountStatus {
  active = "active",
  pending_verification = "pending_verification",
  suspended = "suspended",
  blocked = "blocked",
  closed = "closed"
}

export default BankAccount;