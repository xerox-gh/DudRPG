import * as melon from 'melonjs';
import { biomeAt, loot as worldLoot, npcs, SUN_ALTITUDE, WORLD_HEIGHT, WORLD_WIDTH } from './world';
import type { Loot, Vector } from './types';

export type HudSnapshot = {
  altitude: number;
  biome: string;
  health: number;
  inventory: string[];
  quest: string;
  cheatHeat: number;
};

type Keys = Record<string, boolean>;

type Player = {
  position: Vector;
  velocity: Vector;
  radius: number;
  health: number;
  flyhack: boolean;
};

export class DudRpgGame {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly keys: Keys = {};
  private readonly player: Player = {
    position: { x: 420, y: 4520 },
    velocity: { x: 0, y: 0 },
    radius: 30,
    health: 100,
    flyhack: false,
  };
  private readonly inventory = ['Pocket lint', 'One suspicious bean'];
  private readonly loot: Loot[] = worldLoot.map((item) => ({ ...item }));
  private animationId = 0;
  private lastTime = 0;
  private cheatHeat = 0;
  private quest = 'Get to the Sun. No further instructions.';

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly onHud: (snapshot: HudSnapshot) => void,
  ) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('DudRPG needs a 2D canvas context to render blob crimes.');
    this.ctx = context;
    this.bootstrapMelonJs();
  }

  start() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.tick);
  }

  stop() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  private bootstrapMelonJs() {
    // MelonJS is loaded as the game-engine dependency for the project. This alpha uses
    // a custom canvas renderer while the entity model stays isolated for migration into
    // MelonJS stages, physics bodies, and tilemaps as production assets arrive.
    void melon;
  }

  private readonly onKeyDown = (event: KeyboardEvent) => {
    this.keys[event.key.toLowerCase()] = true;
    if (event.key.toLowerCase() === 'f' && !event.repeat) {
      this.player.flyhack = !this.player.flyhack;
      this.cheatHeat = Math.min(100, this.cheatHeat + 22);
      this.quest = this.player.flyhack ? 'Flyhack enabled. Space Cops are typing...' : 'Flyhack disabled. Plausible deniability restored.';
    }
    if (event.key.toLowerCase() === 'e' && !event.repeat) this.pickupNearbyLoot();
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    this.keys[event.key.toLowerCase()] = false;
  };

  private readonly tick = (time: number) => {
    const dt = Math.min(0.033, (time - this.lastTime) / 1000);
    this.lastTime = time;
    this.update(dt);
    this.render();
    this.publishHud();
    this.animationId = requestAnimationFrame(this.tick);
  };

  private update(dt: number) {
    const left = this.keys.a || this.keys.arrowleft;
    const right = this.keys.d || this.keys.arrowright;
    const up = this.keys.w || this.keys.arrowup;
    const down = this.keys.s || this.keys.arrowdown;
    const speed = this.player.flyhack ? 540 : 330;

    this.player.velocity.x = (right ? speed : 0) - (left ? speed : 0);
    if (this.player.flyhack) {
      this.player.velocity.y = (down ? speed : 0) - (up ? speed : 0);
      this.cheatHeat = Math.min(100, this.cheatHeat + dt * 4);
    } else {
      this.player.velocity.y += 1200 * dt;
      if ((this.keys[' '] || up) && this.isGrounded()) this.player.velocity.y = -620;
      this.cheatHeat = Math.max(0, this.cheatHeat - dt * 7);
    }

    this.player.position.x = clamp(this.player.position.x + this.player.velocity.x * dt, 80, WORLD_WIDTH - 80);
    this.player.position.y = clamp(this.player.position.y + this.player.velocity.y * dt, 180, WORLD_HEIGHT - 210);
    if (this.player.position.y >= WORLD_HEIGHT - 210) {
      this.player.position.y = WORLD_HEIGHT - 210;
      this.player.velocity.y = 0;
    }
  }

  private isGrounded() {
    return this.player.position.y >= WORLD_HEIGHT - 211;
  }

  private pickupNearbyLoot() {
    const item = this.loot.find((candidate) => !candidate.picked && distance(candidate.position, this.player.position) < 120);
    if (!item) {
      this.quest = 'You grasp dramatically at nothing. The nothing is unimpressed.';
      return;
    }
    item.picked = true;
    this.inventory.push(item.name);
    this.quest = `Loot acquired: ${item.name}. ${item.description}`;
  }

  private render() {
    const camera = this.camera();
    const biome = biomeAt(this.player.position.x, this.altitude());
    const { ctx } = this;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const sky = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, biome.sky);
    sky.addColorStop(1, '#f7f0d2');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawSun(camera);
    this.drawGround(camera, biome.color);
    this.drawLoot(camera);
    this.drawNpcs(camera);
    this.drawPlayer(camera);
    this.drawAltitudeLadder(camera);
  }

  private drawGround(camera: Vector, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-camera.x, WORLD_HEIGHT - 180 - camera.y, WORLD_WIDTH, 240);
    this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let x = 0; x < WORLD_WIDTH; x += 160) this.ctx.fillRect(x - camera.x, WORLD_HEIGHT - 180 - camera.y, 82, 18);
  }

  private drawSun(camera: Vector) {
    const y = WORLD_HEIGHT - 180 - SUN_ALTITUDE - camera.y;
    this.ctx.fillStyle = '#ffd447';
    this.ctx.beginPath();
    this.ctx.arc(WORLD_WIDTH - 900 - camera.x, y, 150, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawPlayer(camera: Vector) {
    const x = this.player.position.x - camera.x;
    const y = this.player.position.y - camera.y;
    this.ctx.fillStyle = this.player.flyhack ? '#9cfffb' : '#8f5cff';
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, this.player.radius * 1.15, this.player.radius, Math.sin(performance.now() / 180) * 0.08, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#111827';
    this.ctx.beginPath();
    this.ctx.arc(x - 10, y - 8, 4, 0, Math.PI * 2);
    this.ctx.arc(x + 12, y - 8, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillRect(x - 10, y + 9, 24, 4);
  }

  private drawNpcs(camera: Vector) {
    for (const npc of npcs) {
      const x = npc.position.x - camera.x;
      const y = npc.position.y - camera.y;
      this.ctx.fillStyle = npc.color;
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, npc.radius * 1.2, npc.radius, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#111827';
      this.ctx.font = '14px system-ui';
      this.ctx.fillText(npc.name, x - npc.radius, y - npc.radius - 12);
      if (distance(npc.position, this.player.position) < 180) this.quest = npc.dialogue;
    }
  }

  private drawLoot(camera: Vector) {
    for (const item of this.loot) {
      if (item.picked) continue;
      const x = item.position.x - camera.x;
      const y = item.position.y - camera.y;
      this.ctx.fillStyle = '#fff3a3';
      this.ctx.fillRect(x - 15, y - 15, 30, 30);
      this.ctx.strokeStyle = '#7c4d00';
      this.ctx.strokeRect(x - 15, y - 15, 30, 30);
    }
  }

  private drawAltitudeLadder(camera: Vector) {
    this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let y = WORLD_HEIGHT - 1180; y > WORLD_HEIGHT - SUN_ALTITUDE; y -= 500) {
      this.ctx.fillRect(120 - camera.x, y - camera.y, 90, 14);
    }
  }

  private camera(): Vector {
    return {
      x: clamp(this.player.position.x - this.canvas.width / 2, 0, WORLD_WIDTH - this.canvas.width),
      y: clamp(this.player.position.y - this.canvas.height / 2, 0, WORLD_HEIGHT - this.canvas.height),
    };
  }

  private altitude() {
    return Math.max(0, Math.round(WORLD_HEIGHT - 180 - this.player.position.y));
  }

  private publishHud() {
    this.onHud({
      altitude: this.altitude(),
      biome: biomeAt(this.player.position.x, this.altitude()).name,
      health: this.player.health,
      inventory: [...this.inventory],
      quest: this.quest,
      cheatHeat: Math.round(this.cheatHeat),
    });
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distance(a: Vector, b: Vector) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
