import { useRef } from "react";
import { Text, useGLTF, Clone } from "@react-three/drei";
//types
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import type { ObjectMap } from "@react-three/fiber";
import type { Group } from "three";

interface UncontrolledCharacterProps {
  position: [x: number, y: number, z: number];
  rotation: [x: number, y: number, z: number];
  id: string;
  gltf: GLTF & ObjectMap;
}

const UncontrolledCharacter = ({
  position,
  rotation,
  id,
  gltf,
}: UncontrolledCharacterProps) => {
  // -- useRef to track state of GLTF model group --
  const othersGroup = useRef<Group>(null!);
  const nodes: any = gltf.nodes; // Used any type for nodes because it contains attributes whose type is unknown
  const { materials } = gltf;

  return (
    <>
      <group
        ref={othersGroup}
        dispose={null}
        receiveShadow
        position={position}
        rotation={rotation}
      >
        <group name="Scene">
          {/* <Text
            scale={0.1}
            position={[0, 2, 0]}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {id}
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
      </group>
    </>
  );
};

export default UncontrolledCharacter;
