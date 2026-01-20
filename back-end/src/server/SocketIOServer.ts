import JwtController from "@/controllers/JwtController";
import {Server as HttpServer} from "http";
import { Server as SocketIOServer } from 'socket.io';
const cookieParser = require("cookie-parser");
const cookie = require("cookie");

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
    },
  });
   // Middleware di autenticazione
  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) return next(new Error('Unauthorized: no cookies'));
    const parsed = cookie.parse(cookies);
    const accessToken:string = parsed.access_token;
    if (!accessToken) return next(new Error('Unauthorized: no access token in cookies'));
    try {
      const userId = JwtController.verifyAccessJwt(accessToken);
      if (!userId) return next(new Error('Unauthorized: JWT not valid'));
      socket.data.userId = userId;
      socket.join(`user:${userId}`);
      next();
    } catch (err) {
      next(new Error('Unauthorized: invalid token'));
    }
  });

  // io.on('connection', (socket) => {
  //   console.log('Client connesso:', socket.id);

  //   socket.on('disconnect', () => {
  //     console.log('Client disconnesso:', socket.id);
  //   });
  // });


  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
