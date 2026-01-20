import { type AuthRequest } from "@/controllers/AuthController"
import z from "zod";
import { createSchema as  holderCreateSchema} from "./HolderSchema";

export const createSchema = z.object({
  holder: holderCreateSchema
}).strict();

export const deleteSchema = z.object({ 
  bankAccountIds: z.array(z.string()),
}).strict();


export type GetMeRequest = AuthRequest<{id?: string}, any, {}>;
export type GetIncExpRequest = AuthRequest<{id: string}, any, {}>;
export type CloseRequest = AuthRequest<{id: string}>
export type CreateRequest = AuthRequest<{}, any, z.infer<typeof createSchema>>;
export type DeleteRequest = AuthRequest<{}, any, z.infer<typeof deleteSchema>>;