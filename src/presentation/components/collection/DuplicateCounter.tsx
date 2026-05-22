'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';

interface DuplicateCounterProps {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  maxReached?: boolean;
}

export function DuplicateCounter({
  count,
  onIncrement,
  onDecrement,
  maxReached = false,
}: DuplicateCounterProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onDecrement}
        disabled={count <= 0}
        className="w-8 h-8 p-0 rounded-full"
      >
        −
      </Button>

      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold text-blue-600">{count}</span>
        <span className="text-[10px] text-gray-500">repetidas</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onIncrement}
        disabled={maxReached}
        className="w-8 h-8 p-0 rounded-full"
      >
        +
      </Button>
    </div>
  );
}
