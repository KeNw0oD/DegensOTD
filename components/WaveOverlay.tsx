import React from 'react';

export default function WaveOverlay() {
  const lines: React.JSX.Element[] = [];
  const count = 30;        // количество линий
  const startY = 1000;      // стартовая Y координата
  const gap = 8;           // расстояние между линиями
  const slope = -0.1;      // наклон диагонали (отрицательное — вверх)

  for (let i = 0; i < count; i++) {
    const y = startY - i * gap;

    lines.push(
      <path
        key={i}
        className="w"
        d={`M0 ${y} 
            C 400 ${y - 220 + slope * 300}, 
              600 ${y + 260 + slope * 900}, 
              900 ${y + slope * 100}
            S 1500 ${y - 300 + slope * 100}, 
              1800 ${y + slope * 2800}`}
        stroke="#6fa0a6"
        strokeOpacity={0.05 + i * 0.004}
        strokeWidth="1.8"
        fill="none"
        strokeDasharray="1 3"
      />
    );
  }

  return (
    <svg
      className="waveOverlay"
      viewBox="0 0 1800 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <style>{`.w{stroke-linecap:round;vector-effect:non-scaling-stroke}`}</style>
      </defs>
      {lines}
    </svg>
  );
}
