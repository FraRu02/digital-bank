import { AuthRequest } from "@/controllers/AuthController";
import { type Request } from "express";
import * as z from "zod"; 

export const signinSchema = z.object({ 
  name: z.string(),
  lastname: z.string(),
  email: z.email(),
  taxCode: z.string(),
  password: z.string().max(20).min(6)
}).strict();

export const loginSchema = z.object({ 
  email: z.email(),
  password: z.string().max(20).min(6)
}).strict();

export const verifyOtpSchema = z.object({ 
  code: z.string().length(6),
}).strict();

export type SigninRequest = Request<{}, any, z.infer<typeof signinSchema>>;
export type LoginRequest = Request<{}, any, z.infer<typeof loginSchema>>;
export type VerifyOtpRequest = AuthRequest<{}, any, z.infer<typeof verifyOtpSchema>>;