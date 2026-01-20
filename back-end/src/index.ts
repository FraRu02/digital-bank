import mongoose from "mongoose";
import HttpServer from "./server/HttpServer";
import { initSocket } from "./server/SocketIOServer";

const PORT = 3005;

mongoose.connect("mongodb://localhost:27017/digital-bank?replicaSet=rs0").then(() => {
  const server = HttpServer;
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
  });
});