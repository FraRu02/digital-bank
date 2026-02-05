import server from "@/src/axiosConfig";
import Utilities from "./Utilities";

abstract class User {
  static async get():Promise<UserProps[]> {
    return await server.get("/users").then((res) => res.data);
  }

  static async update(params: any):Promise<void> {
    return await server.put("/users", params).then((res) => res.data);
  }

  static async delete(id: string|string[]): Promise<void> {
    return await server.delete("/users", {data: {
      userIds: Array.isArray(id) ? id : [id]
    }}).then((res) => res.data);
  }

}

export type UserProps = {
  id: string;
  name: string;
  lastname: string;
  taxCode: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  otpExpiresAt?: string;
  otpAttempts?: number;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  member = "member",
  admin = "admin"
}

export enum UserStatus  {
  active = "active",
  pending_verification = "pending_verification"
}

export default User;