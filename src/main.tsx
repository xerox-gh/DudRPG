import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DudRpgGame, type HudSnapshot } from './game/DudRpgGame';
import { Hud } from './ui/Hud';
import './styles.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<DudRpgGame | null>(null);
  const [hud, setHud] = useState<HudSnapshot>({
    altitude: 0,
    biome: 'Suburban Spawn Puddle',
    health: 100,
    inventory: ['Pocket lint', 'One suspicious bean'],
    quest: 'Get to the Sun. No further instructions.',
    cheatHeat: 0,
  });

  useEffect(() => {
    if (!canvasRef.current || gameRef.current) return;
    const game = new DudRpgGame(canvasRef.current, setHud);
    gameRef.current = game;
    game.start();
    return () => game.stop();
  }, []);

  return (
    <main className="app-shell">
      <canvas ref={canvasRef} className="game-canvas" width={1280} height={720} aria-label="DudRPG open world canvas" />
      <Hud snapshot={hud} />
      <section className="controls-card">
        <strong>DudRPG Alpha</strong>
        <span>WASD / arrows: blob-waddle</span>
        <span>Space: dud-jump</span>
        <span>F: toggle flyhack (may anger Space Cops)</span>
        <span>E: pick up nearby trash-tier loot</span>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
