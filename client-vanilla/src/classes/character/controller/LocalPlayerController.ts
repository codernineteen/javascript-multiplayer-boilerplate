import { Vector3, Quaternion } from "three";
import PlayerInput from "../inputs/PlayerInput";
import PlayerStateMachine from "../animation/PlayerStateMachine";
import Character from "../Character";
import type { ClientChannel } from "@geckos.io/client";

export default class LocalPlayerController {
  public input: PlayerInput;
  public stateMachine: PlayerStateMachine;
  public decceleration: Vector3;
  public acceleration: Vector3;
  public velocity: Vector3;
  public isRotUpdated: boolean;
  public isPosUpdated: boolean;

  constructor(
    public parent: Character,
    public channel: ClientChannel,
    public userId: string
  ) {
    this.input = new PlayerInput(this.channel, this.parent, this.userId);
    this.stateMachine = new PlayerStateMachine(this.parent, this.input);
    this.decceleration = new Vector3(-0.0005, -0.0001, -5.0);
    this.acceleration = new Vector3(1, 0.25, 50.0);
    this.velocity = new Vector3(0, 0, 0);
    this.isRotUpdated = false;
    this.isPosUpdated = false;
  }

  public Update(deltaTime: number) {
    //If parent doesn't exist, terminate Update.
    if (!this.parent) {
      return;
    }

    this.stateMachine.UpdateState(deltaTime, this.input);

    /**
     * Character movement update - didn't fully understand this part(quaternion, vector operations, etc)
     */
    const velocity = this.velocity;
    const frameDecceleration = new Vector3(
      //multiply decceleration ratio by velocity component in each axes
      velocity.x * this.decceleration.x,
      velocity.y * this.decceleration.y,
      velocity.z * this.decceleration.z
    );
    frameDecceleration.multiplyScalar(deltaTime);
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const player = this.parent.Mesh;
    const quat = new Quaternion();
    const axis = new Vector3();
    const acc = this.acceleration.clone();
    const rot = player.quaternion.clone();

    //product deltaTime to move character according to device frame rate
    if (this.input.keys.Forward) {
      let dynamicAcc = acc.z;
      if (this.input.keys.Shift) {
        dynamicAcc = acc.z * 2;
      }
      velocity.z += dynamicAcc * deltaTime;
      this.isPosUpdated = true;
    }
    if (this.input.keys.Backward) {
      velocity.z -= acc.z * deltaTime;
      this.isPosUpdated = true;
    }
    if (this.input.keys.Left) {
      axis.set(0, 1, 0); // rotation based on Y-axis(normalized vector)
      quat.setFromAxisAngle(
        axis,
        4.0 * Math.PI * deltaTime * this.acceleration.y
      );
      rot.multiply(quat);
      this.isRotUpdated = true;
    }
    if (this.input.keys.Right) {
      axis.set(0, 1, 0);
      quat.setFromAxisAngle(
        axis,
        4.0 * -Math.PI * deltaTime * this.acceleration.y
      );
      rot.multiply(quat);
      this.isRotUpdated = true;
    }

    player.quaternion.copy(rot);
    const prevPosition = new Vector3();
    prevPosition.copy(player.position);

    const forward = new Vector3(0, 0, 1); // unit vector on axis-z
    forward.applyQuaternion(player.quaternion);
    forward.normalize();

    const sideways = new Vector3(1, 0, 0);
    sideways.applyQuaternion(player.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * deltaTime);
    forward.multiplyScalar(velocity.z * deltaTime);

    player.position.add(forward);
    player.position.add(sideways);
    prevPosition.copy(player.position);

    /**
     * Update animation mixer
     */
    if (this.parent.AnimMixer) {
      this.parent.AnimMixer.update(deltaTime);
    }

    // Check whether character transform is updated
    if (this.isPosUpdated || this.isRotUpdated) {
      console.log("send request");
      //if transform changed
      this.channel.emit("transform update", {
        id: this.userId,
        pos: [prevPosition.x, prevPosition.y, prevPosition.z],
        quat: [
          player.quaternion.x,
          player.quaternion.y,
          player.quaternion.z,
          player.quaternion.w,
        ],
        state: this.stateMachine.currentState?.Name,
        input: this.input.keys,
      });
    }

    //intialize again
    this.isPosUpdated = false;
    this.isRotUpdated = false;
  }
}
