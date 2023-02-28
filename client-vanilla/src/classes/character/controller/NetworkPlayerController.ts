import NetworkPlayerStateMachine from "../animation/NetworkPlayerStateMachine";
import Character from "../Character";
import { KeyInput } from "../inputs/PlayerInput";
import type { ClientChannel } from "@geckos.io/client";

//remove input function, update by socket on event
export default class NetworkPlayerController {
  public stateMachine: NetworkPlayerStateMachine;

  constructor(
    public parent: Character,
    public channel: ClientChannel,
    public userId: string,
    public input: KeyInput
  ) {
    this.stateMachine = new NetworkPlayerStateMachine(this.parent, this.input);
  }

  Update(deltaTime: number) {
    this.parent.AnimMixer.update(deltaTime);
  }
}
