import { Group, Quaternion, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"; // For useRef
import { ControlledCharacterProps } from "../../scene/model/ControlledCharacter";
import useInputs from "../input/PlayerInputs";
import useStateMachine from "../state-machine/StateMachine";

export interface PlayerControllerProps extends ControlledCharacterProps {
  character: React.MutableRefObject<Group | undefined>;
}

export default function PlayerController({
  gltf,
  character,
  socketClient,
}: PlayerControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const movement = useInputs();
  const currentState = useStateMachine({
    socketClient,
    gltf,
    character,
    movement,
  });
  const { camera } = useThree();
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

  const updateCameraTarget = (moveX: number, moveZ: number) => {
    camera.position.x += moveX;
    camera.position.z += moveZ;

    if (character.current) {
      camera.position.y = character.current.position.y + 8;
      cameraTarget.x = character.current.position.x;
      cameraTarget.y = character.current.position.y + 1;
      cameraTarget.z = character.current.position.z;
      if (controlsRef.current) controlsRef.current.target = cameraTarget;
    }
  };

  //game loop (useFrame)
  useFrame((state, delta) => {
    if (currentState == "WalkingInPlace" || currentState == "RunningInPlace") {
      //calculate towards camera direction
      if (character.current) {
        let characterPositionX = character.current.position.x;
        let characterPositionZ = character.current.position.z;

        let angleYCameraDirection = Math.atan2(
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
          angleYCameraDirection + newDirectionOffset
        );
        character.current?.quaternion.rotateTowards(rotateQuarternion, 0.2);

        // calculate direction
        camera.getWorldDirection(walkDirection); // world direction of camera copied into walkDirection
        walkDirection.y = 0; // No direction for y-axis
        walkDirection.normalize(); //normalize direction
        walkDirection.applyAxisAngle(rotateAngle, newDirectionOffset);

        // run / walk velocity
        const velocity = currentState == "RunningInPlace" ? 10 : 5;

        // move character and camera
        const moveX = walkDirection.x * velocity * delta;
        const moveZ = walkDirection.z * velocity * delta;

        character.current.position.x += moveX;
        character.current.position.z += moveZ;
        updateCameraTarget(moveX, moveZ);
      }
    }
  });
  return (
    <>
      <OrbitControls ref={controlsRef} />
    </>
  );
}
