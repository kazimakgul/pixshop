/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef, useState } from 'react';

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.219.874-.219-.874a1.5 1.5 0 00-1.023-1.023l-.874-.219.874-.219a1.5 1.5 0 001.023-1.023l.219-.874.219.874a1.5 1.5 0 001.023 1.023l.874.219-.874.219a1.5 1.5 0 00-1.023 1.023z" />
  </svg>
);

type FeatureTab = 'retouch' | 'crop' | 'expand' | 'insert' | 'adjust' | 'filters';

interface HeaderProps {
  activeTab: FeatureTab;
  onSelectTab: (tab: FeatureTab) => void;
}

const NAV_ITEMS: Array<{ label: string; tab: FeatureTab; helper?: string }> = [
  { label: 'Retouch', tab: 'retouch', helper: 'Spot edits with AI' },
  { label: 'Crop', tab: 'crop', helper: 'Reframe the canvas' },
  { label: 'Expand', tab: 'expand', helper: 'Outpaint with prompts' },
  { label: 'Insert', tab: 'insert', helper: 'Blend new objects' },
  { label: 'Adjust', tab: 'adjust', helper: 'Tone & exposure' },
  { label: 'Filters', tab: 'filters', helper: 'Creative stylization' },
];

const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <header className="w-full py-4 px-8 border-b border-gray-700 bg-gray-800/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-gray-600 bg-gray-900/70 px-3 py-2 text-sm font-medium text-gray-100 shadow-sm transition hover:border-blue-400 hover:text-blue-300"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <span className="flex flex-col gap-1">
              <span className="h-0.5 w-4 bg-current" />
              <span className="h-0.5 w-3 bg-current" />
              <span className="h-0.5 w-4 bg-current" />
            </span>
            <span className="sr-only">Toggle navigation</span>
          </button>
          {isOpen && (
            <nav
              role="menu"
              className="absolute left-0 mt-2 w-52 rounded-md border border-gray-700 bg-gray-900/95 shadow-lg backdrop-blur"
            >
              <ul className="py-2 text-sm text-gray-200">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.tab;
                  return (
                    <li key={item.tab}>
                      <button
                        type="button"
                        role="menuitem"
                        className={`w-full px-4 py-2 text-left transition rounded-sm ${
                          isActive
                            ? 'bg-blue-500/20 text-blue-200'
                            : 'hover:bg-blue-500/20 hover:text-blue-200'
                        }`}
                        onClick={() => {
                          onSelectTab(item.tab);
                          setIsOpen(false);
                        }}
                      >
                        <span className="block font-semibold">{item.label}</span>
                        {item.helper && (
                          <span className="block text-xs text-gray-400">{item.helper}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <SparkleIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-gray-100">
            Pixshop
          </h1>
        </div>
        <div className="w-12" aria-hidden="true" />
      </div>
    </header>
  );
};

export default Header;
