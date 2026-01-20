import { type AuthRequest } from "@/controllers/AuthController";
import * as z from "zod"; 

export const deleteSchema = z.object({ 
  alertIds: z.array(z.string()),
}).strict();

export type GetRequest = AuthRequest<{id?: string}, any, {}>;
export type DeleteRequest = AuthRequest<{}, any, z.infer<typeof deleteSchema>>;
