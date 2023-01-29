import Character from "../Character";
import { KeyInput } from "../inputs/PlayerInput";

export const enum EPlayerState {
  Idle,
  Walk,
  Run,
  Jump,
}

interface States {
  idle: IdleState;
  walk: WalkState;
  run: RunState;
}

type EStates = IdleState | WalkState | RunState | null;

export default class NetworkPlayerStateMachine {
  public currentState: EStates;
  public states: States;

  constructor(public parent: Character, public input: KeyInput) {
    this.currentState = new IdleState(parent, this);
    this.states = {
      idle: new IdleState(parent, this),
      walk: new WalkState(parent, this),
      run: new RunState(parent, this),
    };
  }

  SetState(name: string) {
    const prevState = this.currentState;

    if (prevState) {
      //if stay in same state, just return
      if (prevState.Name == name) {
        return;
      }
    }

    if (name == "idle" || name == "run" || name == "walk") {
      this.currentState = this.states[name];
      this.currentState.Transition(prevState, this.input);
    }
  }

  UpdateState(newState: string) {
    console.log(newState);
    this.currentState?.Update(newState);
  }
}

class State {
  constructor(
    public parent: Character,
    public stateMachine: NetworkPlayerStateMachine
  ) {}

  Transition(_prevState: EStates, _input: KeyInput) {}
  Update(_state: string) {}
}

export class IdleState extends State {
  public curAnimName: string;
  constructor(
    public parent: Character,
    public stateMachine: NetworkPlayerStateMachine
  ) {
    super(parent, stateMachine);
    this.curAnimName = "idle";
  }

  get Name() {
    return "idle";
  }

  Transition(prevState: EStates): void {
    const idleAnimation = this.parent.Animations["idle"];
    if (idleAnimation) {
      const idleAction = idleAnimation.action;
      if (prevState) {
        const prevAction =
          this.parent.Animations[prevState.curAnimName]?.action;
        idleAction.time = 0.0;
        idleAction.enabled = true;
        idleAction.setEffectiveTimeScale(1.0).setEffectiveWeight(1.0);
        if (prevAction) idleAction.crossFadeFrom(prevAction, 0.5, true);
      }
      idleAction.play();
    }
  }

  Update(state: string) {
    this.stateMachine.SetState(state);
  }
}

export class WalkState extends State {
  public curAnimName: string;
  constructor(
    public parent: Character,
    public stateMachine: NetworkPlayerStateMachine
  ) {
    super(parent, stateMachine);
    this.curAnimName = "";
  }

  get Name() {
    return "walk";
  }

  Transition(prevState: EStates, input: KeyInput): void {
    let walkAnimation;
    if (input.Forward) {
      walkAnimation = this.parent.Animations["walkForward"];
      this.curAnimName = "walkForward";
    } else {
      console.log("please walk backward");
      walkAnimation = this.parent.Animations["walkBackward"];
      this.curAnimName = "walkBackward";
    }

    if (walkAnimation) {
      const walkAction = walkAnimation.action;
      if (prevState) {
        const prevAction =
          this.parent.Animations[prevState.curAnimName]?.action;
        walkAction.enabled = true;

        if (prevAction) {
          if (prevState.Name == "run") {
            const ratio =
              walkAction.getClip().duration / prevAction.getClip().duration;
            walkAction.time = prevAction.time * ratio;
          } else {
            walkAction.time = 0.0;
            walkAction.setEffectiveTimeScale(1.0).setEffectiveWeight(1.0);
          }
          walkAction.crossFadeFrom(prevAction, 0.5, true);
        }
      }
      walkAction.play();
    }
  }

  Update(state: string) {
    this.stateMachine.SetState(state);
  }
}

export class RunState extends State {
  public curAnimName: string;
  constructor(
    public parent: Character,
    public stateMachine: NetworkPlayerStateMachine
  ) {
    super(parent, stateMachine);
    this.curAnimName = "";
  }

  get Name() {
    return "run";
  }

  Transition(prevState: EStates, input: KeyInput): void {
    let runAnimation;
    if (input.Forward) {
      runAnimation = this.parent.Animations["runForward"];
      this.curAnimName = "runForward";
    } else {
      runAnimation = this.parent.Animations["runBackward"];
      this.curAnimName = "runBackward";
    }
    if (runAnimation) {
      const runAction = runAnimation.action;
      if (prevState) {
        const prevAction =
          this.parent.Animations[prevState.curAnimName]?.action;
        runAction.enabled = true;

        if (prevAction) {
          if (prevState.Name == "run") {
            const ratio =
              runAction.getClip().duration / prevAction.getClip().duration;
            runAction.time = prevAction.time * ratio;
          } else {
            runAction.time = 0.0;
            runAction.setEffectiveTimeScale(1.0).setEffectiveWeight(1.0);
          }
          runAction.crossFadeFrom(prevAction, 0.5, true);
        }
      }
      runAction.play();
    }
  }

  Update(state: string) {
    this.stateMachine.SetState(state);
  }
}

export class JumpState {}
