/**
 * Entry point dell'applicazione.
 * 
 * Questo file ha la responsabilità di:
 * - stabilire la connessione al database MongoDB
 * - inizializzare il server HTTP Express
 * - configurare il server Socket.IO
 * - avviare l'ascolto su una porta definita
 */

import mongoose from "mongoose";
import HttpServer from "./server/HttpServer";
import { initSocket } from "./server/SocketIOServer";

// Porta su cui il server HTTP rimane in ascolto
const PORT = 3005;

// Connessione al database MongoDB tramite Mongoose
mongoose
  .connect("mongodb://localhost:27017/digital-bank?replicaSet=rs0")
  .then(() => {
    // Istanza del server HTTP (Express)
    const server = HttpServer;

    // Inizializzazione del server Socket.IO sul server HTTP
    initSocket(server);

    // Avvio del server sulla porta specificata
    server.listen(PORT, () => {
      console.log(`Server avviato su http://localhost:${PORT}`);
    });
  });