import React, { useRef } from "react";
import { Socket, io } from "socket.io-client";
import config from "../../config";


export interface SocketInterface {
  curSocket: Socket;
}

export const SocketContext = React.createContext<SocketInterface>(
  {} as SocketInterface
);

export const SocketContextProvider: React.FC = ({
  children,
}) => {

  const socketRef = useRef(io(config.casinoUrl));

  return (
    <SocketContext.Provider
      value={{
        curSocket: socketRef.current,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
