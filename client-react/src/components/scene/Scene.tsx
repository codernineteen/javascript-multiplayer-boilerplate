import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei"; // useThree hook contains default renderer, the scene, your camera, and so on.
import { Suspense, useEffect } from "react";
import { Perf } from "r3f-perf";
import Loading from "../fallbacks/Loading";
import useSocketClient from "./socket-client/SocketClient";
import ControlledCharacter from "./model/ControlledCharacter";
import UncontrolledCharacter from "./model/UncontrolledCharacter";

interface SceneProps {
  cubeMapLoader: THREE.CubeTextureLoader;
}

interface ClientProperty {
  position: [x: number, y: number, z: number];
  rotation: [x: number, y: number, z: number];
}

interface Client {
  [id: string]: ClientProperty;
}

export default function Scene(props: SceneProps) {
  const { scene } = useThree();
  const { socketClient, clients } = useSocketClient();
  // -- GLTF LOADER with drei library --
  const gltf = useGLTF("/models/testCharacter.glb"); // Used any type for nodes because it contains attributes whose type is unknown

  const useSkyBox = () => {
    useEffect(() => {
      props.cubeMapLoader.load(
        [
          "textures/beachTexture/posx.jpg",
          "textures/beachTexture/negx.jpg",
          "textures/beachTexture/posy.jpg",
          "textures/beachTexture/negy.jpg",
          "textures/beachTexture/posz.jpg",
          "textures/beachTexture/negz.jpg",
        ],
        (texture) => {
          scene.background = texture;
          scene.environment = texture;
        }
      );
    }, [scene.background]);

    return null;
  };

  useSkyBox();

  return (
    <>
      <Perf position="top-left" />
      {/* <OrbitControls /> */}
      <ambientLight intensity={0.1} />
      <directionalLight
        color="red"
        position={[0, 0, 0]}
        castShadow={true}
        intensity={4}
        shadow-bias={-0.01}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={500}
        shadow-camera-left={200}
        shadow-camera-right={-200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      <mesh scale={[20, 20, 20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry />
        <meshStandardMaterial />
      </mesh>

      {clients &&
        Object.keys(clients)
          .filter((socketId) => socketId != socketClient?.id)
          .map((id) => {
            const { position, rotation } = clients[id];
            return (
              <Suspense>
                <UncontrolledCharacter
                  position={position}
                  rotation={rotation}
                  id={id}
                  gltf={gltf}
                />
              </Suspense>
            );
          })}

      <Suspense fallback={<Loading />}>
        <ControlledCharacter socketClient={socketClient} gltf={gltf} />
      </Suspense>
    </>
  );
}

useGLTF.preload("/models/characterWithAnims.glb");
