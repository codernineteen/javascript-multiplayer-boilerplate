import { useRef, useState } from "react";
import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
import { Group, Vector3 } from "three";
import PlayerController from "../../controls/controller/PlayerController";
import { useFrame, useThree } from "@react-three/fiber";

type CharacterProps = any;

export default function Character(props: CharacterProps) {
  // -- useRef to track state of GLTF model group --
  const group = useRef<Group>();

  // -- GLTF LOADER with drei library --
  const gltf = useGLTF("/models/testCharacter.glb");
  const nodes: any = gltf.nodes; // Used any type for nodes because it contains attributes whose type is unknown
  const { materials, animations } = gltf;
  const { actions } = useAnimations(animations, group);

  return (
    <>
      <group ref={group} {...props} dispose={null}>
        <group name="Scene">
          <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
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
      </group>
      <PlayerController actions={actions} character={group} />
    </>
  );
}

useGLTF.preload("/models/characterWithAnims.glb");
