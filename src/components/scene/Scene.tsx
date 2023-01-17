import { useThree } from "@react-three/fiber"; // useThree hook contains default renderer, the scene, your camera, and so on.
import { Suspense, useEffect } from "react";
import { Perf } from "r3f-perf";
import Character from "./model/Character";
import Loading from "../fallbacks/Loading";
import { OrbitControls } from "@react-three/drei";

type SceneProps = {
  cubeMapLoader: THREE.CubeTextureLoader;
};

export default function Scene(props: SceneProps) {
  const { scene } = useThree();

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
      <OrbitControls />
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
      <mesh scale={[10, 10, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry />
        <meshStandardMaterial />
      </mesh>

      <Suspense fallback={<Loading />}>
        <Character />
      </Suspense>
    </>
  );
}
