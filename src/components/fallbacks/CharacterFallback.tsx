export default function CharacterFallback() {
  return (
    <mesh scale={[1, 1, 3]}>
      <cylinderBufferGeometry args={[5, 5, 20, 32]} />
      <meshBasicMaterial wireframe color="blue" />
    </mesh>
  );
}
