import { type AuthRequest } from "@/controllers/AuthController";
import { UserRole, UserStatus } from "@/models/UserModel";
import * as z from "zod"; 


export const createSchema = z.object({ 
  email: z.email(),
  password: z.string().max(12).min(6)
}).strict();

export const updateSchema = z.array(
  z.object({ 
    id: z.string(),
    data: z.object({
      name: z.string().optional(),
      lastname: z.string().optional(),
      role: z.enum(UserRole).optional(),
      status: z.enum(UserStatus).optional(),
    })
  }).strict()
);

export const deleteSchema = z.object({ 
  userIds: z.array(z.string()),
}).strict();

export type GetRequest = AuthRequest<{id?: string}>;
export type GetBankAccountRequest = AuthRequest<{id: string}>;
export type GetTransactionsRequest = AuthRequest<{id: string}>;
export type CreateRequest = AuthRequest<{}, any, z.infer<typeof createSchema>>;
export type UpdateRequest = AuthRequest<{}, any, z.infer<typeof updateSchema>>;
export type DeleteRequest = AuthRequest<{}, any, z.infer<typeof deleteSchema>>;