export type Student = {
  id: number;
  name: string;
  marks: Record<string, number>;
  total: number;
  percentage: number;
};

export type Course = {
  name: string;
  max: number;
  pass: number;
};
