import { useRef } from "react";
//import { Clone } from "@react-three/drei";
import PlayerController from "../../controls/controller/PlayerController";
//type import
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "../../../types/socket-client-types";
import type { Socket } from "socket.io-client";
import type { ObjectMap } from "@react-three/fiber";
import type { Group } from "three";

export interface ControlledCharacterProps {
  socketClient: Socket<ServerToClientEvents, ClientToServerEvents> | undefined;
  gltf: GLTF & ObjectMap;
}

export default function ControlledCharacter({
  gltf,
  socketClient,
}: ControlledCharacterProps) {
  // -- useRef to track state of GLTF model group --
  const skeletalMeshGroup = useRef<Group>(null!);
  const nodes: any = gltf.nodes;
  const { materials } = gltf;

  return (
    <>
      <group ref={skeletalMeshGroup} dispose={null} receiveShadow={true}>
        {/* nickname */}
        {/* <Text
            scale={0.1}
            position={[0, 2, 0]}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {socketClient?.id}
          </Text> */}
        <group
          castShadow
          name="Armature"
          scale={0.01}
          rotation={[Math.PI / 2, 0, Math.PI]}
        >
          <primitive object={nodes.mixamorigHips} />
          <skinnedMesh
            name="Alpha_Joints"
            geometry={nodes.geometry}
            material={materials["Alpha_Joints_MAT.001"]}
            skeleton={nodes.Alpha_Joints.skeleton}
          />
          <skinnedMesh
            name="Alpha_Surface"
            geometry={nodes.Alpha_Surface.geometry}
            material={materials["Alpha_Body_MAT.001"]}
            skeleton={nodes.Alpha_Surface.skeleton}
          />
        </group>
      </group>
      <PlayerController
        gltf={gltf}
        character={skeletalMeshGroup}
        socketClient={socketClient}
      />
    </>
  );
}
