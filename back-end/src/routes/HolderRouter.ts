import HolderController from "@/controllers/HolderController";
import { hasUserPermissions, validateSchema } from "@/middleware/UtilitiesMiddleware";
import { UserRole } from "@/models/UserModel";
import express from "express";
const holderRouter = express.Router();

holderRouter.get("/me", HolderController.getMe);
holderRouter.get("/me/:id", HolderController.getMe);
holderRouter.use(hasUserPermissions([UserRole.admin]));
holderRouter.get("/", HolderController.get);
holderRouter.delete("/", HolderController.delete);



export default holderRouter;