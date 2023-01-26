import { useAnimations } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import { PlayerControllerProps } from "../controller/PlayerController";

interface StateMachineProps extends PlayerControllerProps {
  movement: any;
}

const STATES = {
  IDLE: "BreathingIdle",
  WALKING: "WalkingInPlace",
  RUNNING: "RunningInPlace",
  JUMPING: "Jump",
};

const useStateMachine = ({ character, movement, gltf }: StateMachineProps) => {
  const [currentState, setCurrentState] = useState(STATES.IDLE);
  const { forward, backward, left, right, jump, run } = movement;
  const { actions } = useAnimations(gltf.animations, character);
  const actionState = useRef("");

  useEffect(() => {
    if (forward || backward || left || right) {
      setCurrentState(STATES.WALKING);
      if (run) {
        setCurrentState(STATES.RUNNING);
      }
    } else if (jump) {
      setCurrentState(STATES.JUMPING);
    } else {
      setCurrentState(STATES.IDLE);
    }

    if (actionState.current != currentState) {
      const nextActionToPlay = actions[currentState];
      const currentAction = actions[actionState.current];
      currentAction?.fadeOut(0.2);
      nextActionToPlay?.reset().fadeIn(0.2).play();
      actionState.current = currentState;
    }
  }, [currentState, forward, backward, left, right, jump, run]);

  return currentState;
};

export default useStateMachine;