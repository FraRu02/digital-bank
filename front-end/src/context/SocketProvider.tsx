import React, { createContext, useContext, useEffect, useState } from 'react';
import { type Socket } from 'socket.io-client';
import type { DefaultEventsMap } from '@socket.io/component-emitter';
import SocketIo from '@/src/classes/SocketIo/SocketIo';


type SocketContextProps = Socket<DefaultEventsMap, DefaultEventsMap> | null;


const SocketContext = createContext<undefined|SocketContextProps>(undefined);
export const useSocket = () => useContext(SocketContext)!;

const SocketProvider:React.FC<{children?: React.ReactNode}> = ({children}) => {
  const [socket, setSocket] = useState<Socket|null>(null);

  useEffect(() => {
    new SocketIo();
    setSocket(SocketIo.instance);
    return () => {
      SocketIo.instance?.disconnect();
    }
  }, [])

  // const initializeSocket = useCallback(():Socket => {
  //   if (!socket) {
  //     const newSocket = io('http://localhost:3005', {
  //       withCredentials: true, // invia i cookie HttpOnly
  //       autoConnect: false,    // connessione manuale
  //     });

  //     newSocket.on('connect', () => {
  //       console.log('Socket connesso:', newSocket.id);
  //     });

  //     newSocket.on('disconnect', (reason) => {
  //       console.log('Socket disconnesso:', reason);
  //     });

  //     setSocket(newSocket);
  //     return newSocket;
  //   }
  //   return socket;
  // }, [socket]);

  const value:SocketContextProps = socket;

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export default SocketProvider