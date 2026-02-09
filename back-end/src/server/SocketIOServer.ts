/**
 * Inizializzazione e gestione del server Socket.IO.
 *
 * Questo modulo:
 * - crea il server Socket.IO a partire dal server HTTP
 * - gestisce l'autenticazione delle connessioni tramite JWT nei cookie
 * - associa ogni socket a una "room" specifica dell'utente autenticato
 * - espone una funzione per recuperare l'istanza Socket.IO già inizializzata
 */

import JwtController from "@/controllers/JwtController";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
const cookie = require("cookie");

// Istanza condivisa del server Socket.IO
let io: SocketIOServer;

/**
 * Inizializza Socket.IO sul server HTTP fornito.
 * Viene configurato il CORS e il middleware di autenticazione.
 */
export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      // origin: 'http://localhost:5173',
      origin: "https://nexabank.it",
      credentials: true,
    },
  });

  /**
   * Middleware di autenticazione Socket.IO.
   * Verifica la presenza del JWT nei cookie e associa l'utente al socket.
   */
  io.use((socket, next) => {
    // Recupero dei cookie dalla richiesta di handshake
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) return next(new Error("Unauthorized: no cookies"));

    // Parsing dei cookie per estrarre l'access token
    const parsed = cookie.parse(cookies);
    const accessToken: string = parsed.access_token;
    if (!accessToken)
      return next(new Error("Unauthorized: no access token in cookies"));

    try {
      // Verifica del JWT e recupero dell'identificativo utente
      const userId = JwtController.verifyAccessJwt(accessToken);
      if (!userId) return next(new Error("Unauthorized: JWT not valid"));

      // Salvataggio dell'utente nel contesto del socket
      socket.data.userId = userId;

      // Inserimento del socket nella room dedicata all'utente
      socket.join(`user:${userId}`);

      next();
    } catch (err) {
      next(new Error("Unauthorized: invalid token"));
    }
  });

  return io;
};

/**
 * Restituisce l'istanza Socket.IO già inizializzata.
 * Utile per emettere eventi da altre parti dell'applicazione.
 */
export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};