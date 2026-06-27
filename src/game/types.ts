export type Vector = { x: number; y: number };

export type Biome = {
  name: string;
  color: string;
  sky: string;
  flavor: string;
};

export type BlobNpc = {
  id: string;
  name: string;
  position: Vector;
  radius: number;
  color: string;
  dialogue: string;
};

export type Loot = {
  id: string;
  name: string;
  description: string;
  position: Vector;
  picked: boolean;
};
