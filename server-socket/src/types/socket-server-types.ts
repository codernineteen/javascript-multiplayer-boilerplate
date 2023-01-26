type Vector3Array = [x: number, y: number, z: number];

interface ServerToClientEvents {
  Pos: (data: SocketData) => void;
}

interface ClientToServerEvents {
  Pos: (data: SocketData) => void;
}

interface InterServerEvents {
  ping: () => void;
}

//used to type 'socket.data' . ex) interface SocketData {name: string} -> can access socket.data.name
interface SocketData {
  id: number; // each index in clients array
  pos: Vector3Array;
}

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Vector3Array,
};
