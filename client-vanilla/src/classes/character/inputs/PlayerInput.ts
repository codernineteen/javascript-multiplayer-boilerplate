import { SocketType } from "../../../App";
import Character from "../Character";

export interface KeyInput {
  Forward: boolean;
  Left: boolean;
  Backward: boolean;
  Right: boolean;
  Space: boolean;
  Shift: boolean;
}

export default class PlayerInput {
  public keys: KeyInput;
  constructor(
    public socket: SocketType,
    public player: Character,
    public userId: string
  ) {
    this.keys = {
      Forward: false,
      Left: false,
      Backward: false,
      Right: false,
      Space: false,
      Shift: false,
    };

    document.addEventListener("keydown", (evt) => {
      this.OnKeyDownHandler(evt);
    });
    document.addEventListener("keyup", (evt) => {
      this.OnKeyUpHandler(evt);
    });
  }

  /**
   * This function tracks key input and store the result in an this.keys object
   * I used 'evt.code' because 'evt.key' couldn't handle concurrent key inputs in my case
   * @param evt get event object from document
   */
  OnKeyDownHandler(evt: KeyboardEvent) {
    switch (evt.code) {
      case "KeyW":
        this.keys.Forward = true;
        break;

      case "KeyA":
        this.keys.Left = true;
        break;

      case "KeyS":
        this.keys.Backward = true;
        break;

      case "KeyD":
        this.keys.Right = true;
        break;

      case "ShiftLeft":
        this.keys.Shift = true;
        break;

      case "Space":
        this.keys.Space = true;
        break;
    }
  }

  OnKeyUpHandler(evt: KeyboardEvent) {
    switch (evt.code) {
      case "KeyW":
        this.keys.Forward = false;
        this.StopTransformUpdate();
        break;

      case "KeyA":
        this.keys.Left = false;
        break;

      case "KeyS":
        this.keys.Backward = false;
        this.StopTransformUpdate();
        break;

      case "KeyD":
        this.keys.Right = false;
        break;

      case "ShiftLeft":
        this.keys.Shift = false;
        break;

      case "Space":
        this.keys.Space = false;
        break;
    }
  }

  StopTransformUpdate() {
    const playerPos = this.player.Mesh.position;
    const playerQuat = this.player.Mesh.quaternion;
    this.socket.emit("TransformUpdate", {
      userId: this.userId,
      pos: [playerPos.x, playerPos.y, playerPos.z],
      quat: [playerQuat.x, playerQuat.y, playerQuat.z, playerQuat.w],
      state: "idle",
      input: this.keys,
    });
  }
}
