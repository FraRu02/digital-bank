import { type AuthRequest } from "@/controllers/AuthController";
import * as z from "zod"; 


export const createSchema = z.object({ 
  id: z.string().optional(),
  name: z.string(),
  lastname: z.string(),
  dateOfBirth: z.iso.datetime(),
  taxCode: z.string(),
  email: z.email(),
  address: z.object({
    bbox: z.array(z.number()).max(4).optional(),
    geometry: z.object({
      coordinates: z.array(z.number()).max(2),
      type: z.string(),
    }).strict(),
    properties: z.object({
      place_id: z.string(),
      formatted: z.string(),
      street: z.string(),
      housenumber:z.string(),
      city: z.string(),
      postcode: z.string(),
      country: z.string(),
      country_code: z.string(),
      state: z.string(),
      county: z.string(),
      county_code: z.string(),
      lat: z.number(),
      lon: z.number()
    }).strict(),
    type: z.string()
  }),
  phoneNumber: z.string().max(18)
}).strict();

export const deleteSchema = z.object({ 
  holderIds: z.array(z.string()),
}).strict();

export type GetRequest = AuthRequest<{id?: string}, any, {}>;
export type DeleteRequest = AuthRequest<{}, any, z.infer<typeof deleteSchema>>;
