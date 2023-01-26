interface ServerToClientEvents {
  MoveResponse: (payload: any) => void;
}

interface ClientToServerEvents {
  MoveRequest: (
    id: string,
    position: [x: number, y: number, z: number],
    rotation: [x: number, y: number, z: number]
  ) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};
