
import React from 'react';
import { Chain } from '../types';
import { IconChevronDown } from './Icons';

interface ChainSelectorProps {
  label: string;
  chains: Chain[];
  selectedChain: Chain;
  onSelect: (chain: Chain) => void;
  disabled?: boolean;
}

const ChainSelector: React.FC<ChainSelectorProps> = ({ label, chains, selectedChain, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
      <span className="text-sm text-gray-400 font-medium ml-1">{label}</span>
      <div className="relative">
        <button
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-nexus-800 border border-gray-700 hover:border-nexus-accent/50 rounded-xl p-3 transition-all duration-200 disabled:opacity-50"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="relative shrink-0">
                <img src={selectedChain.icon} alt={selectedChain.name} className="w-6 h-6 rounded-full bg-nexus-900" />
            </div>
            <div className="flex flex-col items-start overflow-hidden">
                <span className="font-semibold text-gray-100 truncate">{selectedChain.name}</span>
                {selectedChain.type === 'testnet' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-nexus-accent bg-nexus-accent/10 px-1.5 rounded-sm leading-tight">Testnet</span>
                )}
            </div>
          </div>
          <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-nexus-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-[300px] overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mainnets</div>
            {chains.filter(c => c.type === 'mainnet').map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  onSelect(chain);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
              >
                <img src={chain.icon} alt={chain.name} className="w-6 h-6 rounded-full bg-nexus-900" />
                <span className="font-medium text-gray-200">{chain.name}</span>
                {chain.id === selectedChain.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-nexus-accent"></div>
                )}
              </button>
            ))}
            
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-700/50 mt-1">Testnets</div>
            {chains.filter(c => c.type === 'testnet').map((chain) => (
              <button
                key={chain.id}
                onClick={() => {
                  onSelect(chain);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
              >
                <img src={chain.icon} alt={chain.name} className="w-6 h-6 rounded-full bg-nexus-900 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
                <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-200">{chain.name}</span>
                </div>
                {chain.id === selectedChain.id && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-nexus-accent"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainSelector;
