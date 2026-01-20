import { type AuthRequest } from "@/controllers/AuthController";
import { CardType } from "@/models/CardModel";
import * as z from "zod"; 
import { createSchema as  holderCreateSchema} from "./HolderSchema";


const createBaseSchema = {
  holder: holderCreateSchema
}

export const createSchema = z.union([
  z.object({ 
    ...createBaseSchema,
    type: z.literal(CardType.prepaid),
  }).strict(),
  z.object({
    ...createBaseSchema,
    type: z.literal(CardType.debit),
    bankAccountId: z.string()
  }).strict()
]);

export const deleteSchema = z.object({ 
  cardIds: z.array(z.string()),
}).strict();

export type GetMeRequest = AuthRequest<{id?: string}, any, {}, {bankAccountId?: string}>;
export type GetIncExpRequest = AuthRequest<{id: string}, any, {}>;
export type GetRequest = AuthRequest<{id?: string}, any, {}>;
export type CreateRequest = AuthRequest<{}, any, z.infer<typeof createSchema>>;
export type DeleteRequest = AuthRequest<{}, any, z.infer<typeof deleteSchema>>;