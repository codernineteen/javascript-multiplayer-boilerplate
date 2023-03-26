import * as THREE from "three";

interface ScreenPoint {
  x: number;
  y: number;
  z: number;
}

class ScreenPoint {
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  toScreenPoint(point: ScreenPoint, vector: THREE.Vector3) {
    return new ScreenPoint(
      point.x + vector.x * 0.5,
      point.y - vector.y * 0.5,
      point.z - vector.z * 0.5
    );
  }

  toCartesianCoor(point: ScreenPoint) {
    return new THREE.Vector3(point.x * 0.5, point.y * 0.5, point.z * 0.5);
  }
}

export default ScreenPoint;
