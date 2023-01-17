import { useEffect, useState } from "react";

const useInputs = () => {
  const keys: any = {
    KeyW: "forward",
    KeyS: "backward",
    KeyA: "left",
    KeyD: "right",
    SpaceBar: "jump",
    ShiftLeft: "run",
  };

  const moveFieldByKey = (input: string) => keys[input];

  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    run: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setMovement((prev) => ({ ...prev, [moveFieldByKey(e.code)]: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setMovement((prev) => ({ ...prev, [moveFieldByKey(e.code)]: false }));
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  return movement;
};

export default useInputs;
