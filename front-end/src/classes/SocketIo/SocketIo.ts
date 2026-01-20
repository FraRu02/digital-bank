import { io } from "socket.io-client";
import ExtendedSocket from "./ExtendedSocket";

class SocketIo {
  public static instance:ExtendedSocket|null;
  
  constructor(){
    if(SocketIo.instance) {
      console.log("già esistene");
      return;
    };
    const newSocket = io('http://localhost:3005', {
      withCredentials: true, // invia i cookie HttpOnly
      autoConnect: false,    // connessione manuale
    });

    newSocket.on('connect', () => {
      console.log('Socket connesso:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnesso:', reason);
    });

    newSocket.on('connect_error', (err) => {
      console.error(err.message);
    });

    SocketIo.instance = newSocket;
  } 
}

export default SocketIo;