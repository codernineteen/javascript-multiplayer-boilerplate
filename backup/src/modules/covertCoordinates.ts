const descartesToPolar = (x: number, y: number): number[] => {
  let radius = Math.sqrt(x * x + y * y);
  let rad = Math.atan2(y, x);

  return [radius, rad];
};

const polarToDescartes = (r: number, a: number): number[] => {
  let x = r * Math.cos(a);
  let y = r * Math.sin(a);
  return [x, y];
};

export { descartesToPolar, polarToDescartes };
