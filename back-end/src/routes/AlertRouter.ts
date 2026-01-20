import AlertController from "@/controllers/AlertController";
import express from "express";
const alertRouter = express.Router();

alertRouter.get("/me", AlertController.getMe);
alertRouter.delete("/me", AlertController.deleteMe);
export default alertRouter;