require("dotenv").config();
import express from "express";
import { PATH } from "../pathPermissionsConfig";
import http from "http";
import authRouter from "@/routes/AuthRouter";
import AuthController from "@/controllers/AuthController";
import bankAccountRouter from "@/routes/BankAccountRouter";
import cardRouter from "@/routes/CardRouter";
import transactionRouter from "@/routes/TransactionRouter";
import userRouter from "@/routes/UserRouter";
import holderRouter from "@/routes/HolderRouter";
import alertRouter from "@/routes/AlertRouter";
// import userRouter from "@/routes/userRouter";

const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
app.set("trust proxy", 1)

app.use(express.json());
app.use(cors({
  origin: "https://nexabank.it",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(cookieParser());
app.use(PATH.auth, authRouter);
app.use(AuthController.authenticate);
app.use(PATH.bankAccount, bankAccountRouter);
app.use(PATH.card, cardRouter);
app.use(PATH.transaction, transactionRouter);
app.use(PATH.user, userRouter);
app.use(PATH.holder, holderRouter);
app.use(PATH.alert, alertRouter);


// Creare il server HTTP
export default http.createServer(app);
