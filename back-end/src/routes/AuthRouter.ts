import express from "express";
import AuthController from "@/controllers/AuthController";
import { validateSchema } from "@/middleware/UtilitiesMiddleware";
import { loginSchema, signinSchema, verifyOtpSchema } from "@/schemas/AuthSchema";
const authRouter = express.Router();

authRouter.get("/", (req, res) => AuthController.authenticate(req, res, null));
authRouter.post("/signin", validateSchema(signinSchema), AuthController.signin);
authRouter.post("/login", validateSchema(loginSchema), AuthController.login);
authRouter.get("/logout", AuthController.logout);
authRouter.get("/refreshToken", AuthController.refreshToken);
authRouter.post("/verifyOtp", validateSchema(verifyOtpSchema), AuthController.verifyOtp)
authRouter.get("/resendOtp", AuthController.resendOtp)


export default authRouter;