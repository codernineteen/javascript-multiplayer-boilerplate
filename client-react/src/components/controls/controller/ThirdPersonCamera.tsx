import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, Group } from "three";

const useThirdPersonCamera = (
  character: React.MutableRefObject<Group | undefined>
) => {
  const { camera } = useThree();

  const updateCamera = () => {
    if (character.current) {
      const { x, y, z } = character.current.position;
      const idealOffset = new Vector3(x, y + 8, z - 4.5);
      idealOffset.applyQuaternion(character.current.quaternion);
      camera.position.copy(idealOffset);
    }
  };

  useFrame(() => {
    updateCamera();
  });
};

export default useThirdPersonCamera;
