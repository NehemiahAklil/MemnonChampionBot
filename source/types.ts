type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type Deunionize<T extends object> = T & Partial<UnionToIntersection<T>>;

export const deunionize = <T extends object>(t: T): Deunionize<T> => t;
