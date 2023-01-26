import { useProgress, Html } from "@react-three/drei";

export default function Loading() {
  const { progress } = useProgress();
  return <Html center>{progress}% loaded...</Html>;
}
