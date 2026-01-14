import React from 'react';
import { Badge } from './ui/badge';

interface KeyboardShortcutProps {
  keys: string[];
  description: string;
}

export const KeyboardShortcut: React.FC<KeyboardShortcutProps> = ({ keys, description }) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
      <span className="text-slate-300 text-sm">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <Badge variant="outline" className="px-2 py-1 text-xs font-mono bg-slate-800 border-slate-600 text-slate-300">
              {key}
            </Badge>
            {index < keys.length - 1 && <span className="text-slate-500 text-xs">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
