import express from "express";
import UserController from "@/controllers/UserController";
import { hasUserPermissions, validateSchema } from "@/middleware/UtilitiesMiddleware";
import { createSchema, deleteSchema, updateSchema } from "@/schemas/UserSchema";
import { UserRole } from "@/models/UserModel";
const userRouter = express.Router();

userRouter.use(hasUserPermissions([UserRole.admin]));
userRouter.get("/", UserController.get);
userRouter.get("/:id", UserController.get);
userRouter.get("/:id/bankAccounts", UserController.getBankAccount);
userRouter.get("/:id/transactions", UserController.getTransactions);
userRouter.post("/", validateSchema(createSchema), UserController.create);
userRouter.put("/", validateSchema(updateSchema), UserController.update)
userRouter.delete("/", validateSchema(deleteSchema), UserController.delete)

export default userRouter;