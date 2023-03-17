interface KeyInput {
  Forward: boolean;
  Left: boolean;
  Backward: boolean;
  Right: boolean;
  Space: boolean;
  Shift: boolean;
}

interface TransformPacket {
  id: string;
  pos: [x: number, y: number, z: number];
  quat: [x: number, y: number, z: number, w: number];
  state: string | undefined; //state is undefined when the application mounted
  input: KeyInput;
}

export type { KeyInput, TransformPacket };
