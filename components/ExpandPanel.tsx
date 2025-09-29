/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { ArrowsOutIcon } from './icons';

interface ExpandPanelProps {
  onApplyExpand: (prompt: string) => void;
  onSetAspect: (aspect: number | undefined) => void;
  isLoading: boolean;
  currentAspect: number | undefined;
  originalAspect: number;
}

const ExpandPanel: React.FC<ExpandPanelProps> = ({ onApplyExpand, onSetAspect, isLoading, currentAspect, originalAspect }) => {
  const [prompt, setPrompt] = useState('');

  const handleApply = () => {
    onApplyExpand(prompt);
  };

  const aspects = [
    { name: 'Portrait', options: [{ name: '9:16', value: 9 / 16 }, { name: '4:5', value: 4 / 5 }, { name: '2:3', value: 2 / 3 }] },
    { name: 'Square', options: [{ name: '1:1', value: 1 / 1 }] },
    { name: 'Landscape', options: [{ name: '16:9', value: 16 / 9 }, { name: '4:3', value: 4 / 3 }, { name: '3:2', value: 3 / 2 }] },
    { name: 'Banner', options: [{ name: '2:1', value: 2 / 1 }, { name: '3:1', value: 3 / 1 }] },
  ];

  const showGenerateButton = currentAspect && Math.abs(currentAspect - originalAspect) > 0.001;

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col gap-4 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2">
        <ArrowsOutIcon className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-center text-gray-300">Generative Expand</h3>
      </div>
      <p className="text-sm text-center text-gray-400 -mt-2">Change the aspect ratio and fill the new space with AI.</p>
      
      <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">Aspect Ratio:</span>
            <button
                onClick={() => onSetAspect(undefined)}
                disabled={isLoading}
                className={`px-3 py-1 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                !currentAspect
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
            >
                Original
            </button>
          </div>
          {aspects.map(group => (
              <div key={group.name} className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <span className="text-sm text-gray-400 font-medium">{group.name}</span>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    {group.options.map(({ name, value }) => (
                      <button
                        key={name}
                        onClick={() => onSetAspect(value)}
                        disabled={isLoading}
                        className={`w-full py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
                        currentAspect === value
                          ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20' 
                          : 'bg-white/10 hover:bg-white/20 text-gray-200'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
              </div>
          ))}
      </div>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Optional: guide the fill (e.g., 'add more beach and ocean')"
        className="flex-grow bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition w-full disabled:cursor-not-allowed disabled:opacity-60 text-base"
        disabled={isLoading || !currentAspect}
      />

      {showGenerateButton && (
        <div className="animate-fade-in flex flex-col gap-4 pt-2">
            <button
                onClick={handleApply}
                className="w-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading || !currentAspect}
            >
                Generate Expansion
            </button>
        </div>
      )}
    </div>
  );
};

export default ExpandPanel;