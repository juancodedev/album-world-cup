'use client';

import { useEffect, useState } from 'react';

const TARGET = new Date('2026-06-11T19:00:00Z').getTime();

interface TimeLeft {
  days: string;
  hrs: string;
  min: string;
  sec: string;
}

function calc(): TimeLeft {
  const diff = Math.max(0, TARGET - Date.now());
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
  return {
    days: pad(diff / 86400000),
    hrs: pad((diff % 86400000) / 3600000),
    min: pad((diff % 3600000) / 60000),
    sec: pad((diff % 60000) / 1000),
  };
}

export function Countdown() {
  const [t, setT] = useState<TimeLeft>(calc);

  useEffect(() => {
    const id = setInterval(() => setT(calc), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold tracking-wider">
        <span className="bg-secondary text-secondary-foreground rounded-md px-1.5 py-1 min-w-[28px]">{t.days}</span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-secondary text-secondary-foreground rounded-md px-1.5 py-1 min-w-[24px]">{t.hrs}</span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-secondary text-secondary-foreground rounded-md px-1.5 py-1 min-w-[24px]">{t.min}</span>
        <span className="text-muted-foreground">:</span>
        <span className="bg-secondary text-secondary-foreground rounded-md px-1.5 py-1 min-w-[24px]">{t.sec}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Para el mundial 2026</p>
    </div>
  );
}
