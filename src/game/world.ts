import type { Biome, BlobNpc, Loot } from './types';

export const WORLD_WIDTH = 9000;
export const WORLD_HEIGHT = 5200;
export const SUN_ALTITUDE = 10000;

export const biomes: Biome[] = [
  { name: 'Suburban Spawn Puddle', color: '#567d46', sky: '#87ceeb', flavor: 'A legally distinct lawn where destiny smells like wet cardboard.' },
  { name: 'Infinite Parking Lot', color: '#5f6470', sky: '#8ab4f8', flavor: 'Every space is compact. Every cart has chosen violence.' },
  { name: 'Bureaucratic Badlands', color: '#b88850', sky: '#f3b66a', flavor: 'Forms in triplicate tumble across the cursed dunes.' },
  { name: 'Low Orbit-ish', color: '#3d3764', sky: '#171c3a', flavor: 'Space begins wherever the physics engine gives up.' },
];

export function biomeAt(x: number, altitude: number): Biome {
  if (altitude > 6500) return biomes[3];
  const index = Math.min(biomes.length - 2, Math.max(0, Math.floor(x / (WORLD_WIDTH / 3))));
  return biomes[index];
}

export const npcs: BlobNpc[] = [
  { id: 'gary', name: 'Gary the Tutorial Blob', position: { x: 520, y: 4560 }, radius: 34, color: '#ff8bd1', dialogue: 'Welcome, hero. The Sun is up. That is literally all we know.' },
  { id: 'cartlord', name: 'Cartlord 9000', position: { x: 2850, y: 4580 }, radius: 42, color: '#b5f7ff', dialogue: 'Bring me one wheel and I shall reveal the forbidden shopping cart aviation meta.' },
  { id: 'clerk', name: 'DMV Blob of Consequence', position: { x: 6100, y: 4550 }, radius: 38, color: '#ffd166', dialogue: 'To reach the Sun, first submit Form LOL-404: Intent to Ascend.' },
];

export const loot: Loot[] = [
  { id: 'couch', name: 'Old Couch Block', description: '+1 tower piece. Smells like side quests.', position: { x: 900, y: 4620 }, picked: false },
  { id: 'booster', name: 'Duct-Taped Rocket Booster', description: 'Unsafe at any speed, especially parked.', position: { x: 3100, y: 4620 }, picked: false },
  { id: 'sock', name: 'Static Socks', description: 'Carpet friction weaponized by terrible choices.', position: { x: 5450, y: 4620 }, picked: false },
  { id: 'bean', name: 'Suspicious Sun Bean', description: 'Whispers: plant me upward, coward.', position: { x: 7600, y: 4620 }, picked: false },
];
