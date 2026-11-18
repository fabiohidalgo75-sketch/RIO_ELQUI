/** Clases de profundidad usadas en mapas y mensajes (concepto 3: "manzanas > 1,5 m"). */
export enum DepthClass {
  D0_05 = 'D0_05', // 0 – 0,5 m
  D05_15 = 'D05_15', // 0,5 – 1,5 m
  D15_PLUS = 'D15_PLUS', // > 1,5 m
}

export function depthClassOf(depthM: number): DepthClass | null {
  if (depthM <= 0.05) return null;
  if (depthM < 0.5) return DepthClass.D0_05;
  if (depthM < 1.5) return DepthClass.D05_15;
  return DepthClass.D15_PLUS;
}
