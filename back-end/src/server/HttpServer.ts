/**
 * Configurazione e inizializzazione del server HTTP.
 * 
 * Questo file si occupa di:
 * - configurare l'applicazione Express
 * - applicare middleware globali (CORS, parsing JSON, cookie)
 * - registrare le rotte pubbliche e protette
 * - esportare il server HTTP utilizzato anche da Socket.IO
 */

require("dotenv").config();
import express from "express";
import { PATH } from "../pathConfig";
import http from "http";

// Router delle diverse aree funzionali dell'applicazione
import authRouter from "@/routes/AuthRouter";
import AuthController from "@/controllers/AuthController";
import bankAccountRouter from "@/routes/BankAccountRouter";
import cardRouter from "@/routes/CardRouter";
import transactionRouter from "@/routes/TransactionRouter";
import userRouter from "@/routes/UserRouter";
import holderRouter from "@/routes/HolderRouter";
import alertRouter from "@/routes/AlertRouter";

const cors = require("cors");
const cookieParser = require("cookie-parser");

// Istanza principale dell'app Express
const app = express();

// Impostazione necessaria per gestire correttamente proxy e cookie secure
app.set("trust proxy", 1);

// Middleware per il parsing del body JSON delle richieste
app.use(express.json());

// Configurazione CORS per consentire richieste cross-origin dal frontend
app.use(
  cors({
    // origin: "https://nexabank.it",
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

// Middleware per il parsing dei cookie nelle richieste HTTP
app.use(cookieParser());

// Registrazione delle rotte pubbliche (autenticazione)
app.use(PATH.auth, authRouter);

// Middleware di autenticazione applicato a tutte le rotte successive
app.use(AuthController.authenticate);

// Registrazione delle rotte protette dell'applicazione
app.use(PATH.bankAccount, bankAccountRouter);
app.use(PATH.card, cardRouter);
app.use(PATH.transaction, transactionRouter);
app.use(PATH.user, userRouter);
app.use(PATH.holder, holderRouter);
app.use(PATH.alert, alertRouter);

// Creazione ed esportazione del server HTTP
export default http.createServer(app);