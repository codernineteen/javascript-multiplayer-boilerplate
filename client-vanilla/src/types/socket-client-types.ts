type Vector3Array = [x: number, y: number, z: number];

interface ServerToClientEvents {
  Pos: (data: Vector3Array) => void;
}

interface ClientToServerEvents {
  Pos: (data: Vector3Array) => void;
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
