import express from "express";
import CardController from "@/controllers/CardController";
import { hasUserPermissions, validateSchema } from "@/middleware/UtilitiesMiddleware";
import { UserRole } from "@/models/UserModel";
import { createSchema, deleteSchema, resendOtpSchema, verifyOtpSchema } from "@/schemas/CardSchema";
const cardRouter = express.Router();

cardRouter.get("/me", CardController.getMe);
cardRouter.get("/me/:id", CardController.getMe);
cardRouter.get("/me/:id/incExp", CardController.getIncAndExp);
cardRouter.post("/me", validateSchema(createSchema), CardController.create);
cardRouter.post("/verifyOtp", validateSchema(verifyOtpSchema), CardController.verifyOtp);
cardRouter.post("/resendOtp", validateSchema(resendOtpSchema), CardController.resendOtp);
cardRouter.use(hasUserPermissions([UserRole.admin]));
cardRouter.get("/", CardController.get);
cardRouter.get("/:id", CardController.get);
cardRouter.delete("/", validateSchema(deleteSchema), CardController.delete);
export default cardRouter;