import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../types/socket-client-types";

interface ClientProperty {
  position: [x: number, y: number, z: number];
  rotation: [x: number, y: number, z: number];
}

interface Client {
  [id: string]: ClientProperty;
}

const useSocketClient = () => {
  //create a client only after the component rendered
  //user themselves
  const [socketClient, setSocketClient] =
    useState<Socket<ServerToClientEvents, ClientToServerEvents>>();
  //other users
  const [clients, setClients] = useState<Client>(null!);

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      "http://localhost:5555"
    );
    setSocketClient(socket);

    return () => {
      if (socketClient) socketClient.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socketClient) {
      socketClient.on("MoveResponse", (clients) => {
        setClients(clients);
      });
    }
  }, [socketClient]);

  return { clients, socketClient };
};

export default useSocketClient;
