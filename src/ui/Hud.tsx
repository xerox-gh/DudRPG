import type { HudSnapshot } from '../game/DudRpgGame';
import { SUN_ALTITUDE } from '../game/world';

type HudProps = {
  snapshot: HudSnapshot;
};

export function Hud({ snapshot }: HudProps) {
  const sunProgress = Math.min(100, Math.round((snapshot.altitude / SUN_ALTITUDE) * 100));

  return (
    <aside className="hud-panel">
      <header>
        <p className="eyebrow">Current dumb objective</p>
        <h1>Get to the Sun</h1>
      </header>
      <div className="stat-grid">
        <Stat label="Altitude" value={`${snapshot.altitude}m`} />
        <Stat label="Sun%" value={`${sunProgress}%`} />
        <Stat label="Health" value={`${snapshot.health}/100`} />
        <Stat label="Cheat Heat" value={`${snapshot.cheatHeat}%`} />
      </div>
      <section>
        <p className="eyebrow">Biome</p>
        <h2>{snapshot.biome}</h2>
      </section>
      <section>
        <p className="eyebrow">Quest Log</p>
        <p className="quest-text">{snapshot.quest}</p>
      </section>
      <section>
        <p className="eyebrow">Inventory of questionable choices</p>
        <ul className="inventory-list">
          {snapshot.inventory.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
