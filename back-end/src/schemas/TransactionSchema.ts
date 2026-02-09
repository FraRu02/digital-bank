import { type AuthRequest } from "@/controllers/AuthController";
import { TransactionType } from "@/models/TransactionModel";
import * as z from "zod"; 

const createBaseSchema = {
  type: z.literal(TransactionType.transfer),
  sourceCardNumber: z.string(),
  import: z.number().min(0),
  description: z.string().max(100).optional()
}

export const createSchema = z.union([
  z.object({
    ...createBaseSchema,
    destinationIban: z.string(),
    destinationCardNumber: z.undefined(),
  }).strict(),
  z.object({
    ...createBaseSchema,
    destinationIban: z.undefined(),
    destinationCardNumber: z.string(),
  }).strict()
]);

export const deleteSchema = z.object({ 
  transactionIds: z.array(z.string()),
}).strict();


export type CreateInput = z.infer<typeof createSchema>;

export type GetMeRequest = AuthRequest<{id?: string}, any, {}, {cardId?: string}>;
export type GetRequest = AuthRequest<{id?: string}, any, {}>;
export type CreateRequest = AuthRequest<{}, any, z.infer<typeof createSchema>>;
export type DeleteRequest = AuthRequest<{}, any, z.infer<typeof deleteSchema>>;