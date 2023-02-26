interface KeyInput {
  Forward: boolean;
  Left: boolean;
  Backward: boolean;
  Right: boolean;
  Space: boolean;
  Shift: boolean;
}

interface ServerToClientEvents {
  Initialize: (data: {
    userId: string;
    pos: [x: number, y: number, z: number];
    quat: [x: number, y: number, z: number, w: number];
    state: string | undefined; //state is undefined when the application mounted
    input: KeyInput;
  }) => void;

  TransformUpdate: (data: {
    userId: string;
    pos: [x: number, y: number, z: number];
    quat: [x: number, y: number, z: number, w: number];
    state: string | undefined; //state is undefined when the application mounted
    input: KeyInput;
  }) => void;

  CleanUpMesh: (userId: string) => void;

  ResponseMessage: (message: string) => void;
}

interface ClientToServerEvents {
  Initialize: (data: {
    userId: string;
    pos: [x: number, y: number, z: number];
    quat: [x: number, y: number, z: number, w: number];
    state: string | undefined; //state is undefined when the application mounted
    input: KeyInput;
  }) => void;

  TransformUpdate: (data: {
    userId: string;
    pos: [x: number, y: number, z: number];
    quat: [x: number, y: number, z: number, w: number];
    state: string | undefined; //state is undefined when the application mounted
    input: KeyInput;
  }) => void;

  CleanUpMesh: (userId: string) => void;

  RequestMessage: (message: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

//used to type 'socket.data' . ex) interface SocketData {name: string} -> can access socket.data.name
interface SocketData {
  userId: string; // each index in clients array
  pos: [x: number, y: number, z: number];
  quat: [x: number, y: number, z: number, w: number];
}

export type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
};