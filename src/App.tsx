import { Canvas } from "@react-three/fiber";
import Scene from "./components/scene/Scene";
import * as THREE from "three";

//Canvas object is where you start to define your React Three Fiber Scene
function App() {
  return (
    <Canvas
      shadows={true}
      camera={{
        fov: 60,
        near: 1,
        aspect: 1920 / 1080,
        far: 1000,
        position: [15, 5, 0],
      }}
    >
      <Scene cubeMapLoader={new THREE.CubeTextureLoader()} />
    </Canvas>
  );
}

export default App;
