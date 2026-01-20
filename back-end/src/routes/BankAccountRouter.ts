import express from "express";
import BankAccountController from "@/controllers/BankAccountController";
import { hasUserPermissions, validateSchema } from "@/middleware/UtilitiesMiddleware";
import { UserRole } from "@/models/UserModel";
import { deleteSchema, createSchema } from "@/schemas/BankAccountSchema";
import { create } from "domain";

const bankAccountRouter = express.Router();

bankAccountRouter.get("/me", BankAccountController.getMe);
bankAccountRouter.get("/me/:id", BankAccountController.getMe);
bankAccountRouter.get("/me/:id/incExp", BankAccountController.getIncAndExp);
bankAccountRouter.post("/me", validateSchema(createSchema), BankAccountController.create);
bankAccountRouter.patch("/:id/close", BankAccountController.close);
bankAccountRouter.delete("/:id", BankAccountController.delete);
bankAccountRouter.use(hasUserPermissions([UserRole.admin]));
bankAccountRouter.get("/", BankAccountController.get);
bankAccountRouter.delete("/", validateSchema(deleteSchema), BankAccountController.delete);


export default bankAccountRouter;