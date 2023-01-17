import { AnimationAction, Group, Quaternion, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import useInputs from "../input/PlayerInputs";
import useStateMachine from "../state-machine/StateMachine";

export interface PlayerControllerProps {
  actions: { [x: string]: AnimationAction | null };
  character: React.MutableRefObject<Group | undefined>;
}

export default function PlayerController(props: PlayerControllerProps) {
  const controlsRef = useRef<typeof OrbitControls>();
  const { camera } = useThree();
  const movement = useInputs();
  const currentState = useStateMachine({ ...props, movement });
  const { character } = props;
  const { forward, backward, left, right } = movement;

  let walkDirection = new Vector3();
  let rotateAngle = new Vector3(0, 1, 0);
  let rotateQuarternion = new Quaternion();
  let cameraTarget = new Vector3();

  const directionOffset = ({ forward, backward, left, right }: any) => {
    let offset = 0;
    if (forward) {
      if (left) {
        offset = Math.PI / 4;
      } else if (right) {
        offset = -Math.PI / 4;
      }
    } else if (backward) {
      if (left) {
        offset = Math.PI / 4 + Math.PI / 2;
      } else if (right) {
        offset = -Math.PI / 4 - Math.PI / 2;
      } else {
        offset = Math.PI;
      }
    } else if (left) {
      offset = Math.PI / 2;
    } else if (right) {
      offset = -Math.PI / 2;
    }

    return offset;
  };

  const updateCamerTarget = (moveX: number, moveZ: number) => {
    camera.position.x += moveX;
    camera.position.z += moveZ;

    if (character.current) {
      cameraTarget.x = character.current.position.x;
      cameraTarget.y = character.current.position.y + 2;
      cameraTarget.z = character.current.position.z;
      if (controlsRef.current) controlsRef.current.target = cameraTarget;
    }
  };

  //game loop (useFrame)
  useFrame((state, delta) => {
    if (currentState == "WalkingInPlace" || currentState == "RunningInPlace") {
      //calculate towards camera direction
      let characterPositionX = 0,
        characterPositionZ = 0;
      if (character.current) {
        characterPositionX = character.current.position.x;
        characterPositionZ = character.current.position.z;
      }

      let angleYCameraDiraction = Math.atan2(
        camera.position.x - characterPositionX,
        camera.position.z - characterPositionZ
      );
      // diagonal movement angle offset
      let newDirectionOffset = directionOffset({
        forward,
        backward,
        left,
        right,
      });

      // rotate model
      rotateQuarternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDiraction + newDirectionOffset
      );
      character.current?.quaternion.rotateTowards(rotateQuarternion, 0.2);

      // calculate direction
      camera.getWorldDirection(walkDirection);
      walkDirection.y = 0;
      walkDirection.normalize();
      walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset);

      // run / walk velocity
      const velocity = currentState == "RunningInPlace" ? 10 : 5;

      // move character and camera
      const moveX = walkDirection.x * velocity * delta;
      const moveZ = walkDirection.z * velocity * delta;
      if (character.current) {
        character.current.position.x += moveX;
        character.current.position.z += moveZ;
      }
      updateCamerTarget(moveX, moveZ);
    }
  });
  return (
    <>
      <OrbitControls makeDefault ref={controlsRef} />
    </>
  );
}
