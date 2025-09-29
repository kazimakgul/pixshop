/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface RemoveBackgroundPanelProps {
  onApplyRemoveBackground: (type: 'transparent' | 'color', color?: string) => void;
  isLoading: boolean;
}

const RemoveBackgroundPanel: React.FC<RemoveBackgroundPanelProps> = ({ onApplyRemoveBackground, isLoading }) => {
  const [backgroundType, setBackgroundType] = useState<'transparent' | 'color'>('transparent');
  const [color, setColor] = useState('#FFFFFF');

  const handleApply = () => {
    if (backgroundType === 'transparent') {
      onApplyRemoveBackground('transparent');
    } else {
      onApplyRemoveBackground('color', color);
    }
  };

  return (
    <div className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col items-center gap-4 animate-fade-in backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-gray-300">Remove Background</h3>
      <p className="text-sm text-gray-400 -mt-2">Cut out the main subject and place it on a new background.</p>

      <div className="flex items-center gap-2 p-1 bg-gray-900/50 rounded-lg">
        <button
          onClick={() => setBackgroundType('transparent')}
          disabled={isLoading}
          className={`px-6 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
            backgroundType === 'transparent'
              ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-transparent hover:bg-white/10 text-gray-300'
          }`}
        >
          Transparent
        </button>
        <button
          onClick={() => setBackgroundType('color')}
          disabled={isLoading}
          className={`px-6 py-2 rounded-md text-base font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
            backgroundType === 'color'
              ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-transparent hover:bg-white/10 text-gray-300'
          }`}
        >
          Solid Color
        </button>
      </div>

      {backgroundType === 'color' && (
        <div className="flex items-center gap-3 animate-fade-in">
            <label htmlFor="bg-color-picker" className="text-sm font-medium text-gray-400">Choose a color:</label>
            <div className="relative w-10 h-10 rounded-md overflow-hidden border-2 border-gray-600">
                <input
                    type="color"
                    id="bg-color-picker"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={isLoading}
                    className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] cursor-pointer"
                    title="Select background color"
                />
            </div>
            <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isLoading}
                className="w-28 bg-gray-800 border border-gray-600 text-gray-200 rounded-lg p-2 text-center focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                aria-label="Background color hex code"
            />
        </div>
      )}

      <button
        onClick={handleApply}
        disabled={isLoading}
        className="w-full max-w-xs mt-2 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-px active:scale-95 active:shadow-inner text-base disabled:from-blue-800 disabled:to-blue-700 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none"
      >
        Remove Background
      </button>
    </div>
  );
};

export default RemoveBackgroundPanel;
