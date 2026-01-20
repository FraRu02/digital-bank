import express from "express";
import TransactionController from "@/controllers/TransactionController";
import { hasUserPermissions, validateSchema } from "@/middleware/UtilitiesMiddleware";
import { createSchema } from "@/schemas/TransactionSchema";
import { UserRole } from "@/models/UserModel";
import { deleteSchema } from "@/schemas/TransactionSchema";
const transactionRouter = express.Router();

transactionRouter.get("/me", TransactionController.getMe);
transactionRouter.get("/me/:id", TransactionController.getMe);
transactionRouter.post("/", validateSchema(createSchema), TransactionController.create);
transactionRouter.use(hasUserPermissions([UserRole.admin]));
transactionRouter.get("/", TransactionController.get);
transactionRouter.get("/:id", TransactionController.get);
transactionRouter.delete("/", validateSchema(deleteSchema), TransactionController.delete);



export default transactionRouter;