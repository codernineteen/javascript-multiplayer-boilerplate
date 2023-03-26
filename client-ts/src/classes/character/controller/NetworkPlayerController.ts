import NetworkPlayerStateMachine from "../animation/NetworkPlayerStateMachine";
import Character from "../Character";
import { SocketType } from "../../../router/Router";
import { KeyInput } from "../inputs/PlayerInput";

//remove input function, update by socket on event
export default class NetworkPlayerController {
  //public stateMachine: PlayerStateMachine;
  public stateMachine: NetworkPlayerStateMachine;

  constructor(
    public parent: Character,
    public socket: SocketType,
    public userId: string,
    public input: KeyInput
  ) {
    this.stateMachine = new NetworkPlayerStateMachine(this.parent, this.input);
  }

  Update(deltaTime: number) {
    this.parent.AnimMixer.update(deltaTime);
  }
}
