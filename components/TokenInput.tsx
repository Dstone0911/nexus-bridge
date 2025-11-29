
import React from 'react';
import { Token } from '../types';
import { IconChevronDown } from './Icons';

interface TokenInputProps {
  tokens: Token[];
  selectedToken: Token;
  amount: string;
  balance: string;
  onAmountChange: (value: string) => void;
  onTokenSelect: (token: Token) => void;
  onMax: () => void;
}

const TokenInput: React.FC<TokenInputProps> = ({ 
  tokens, 
  selectedToken, 
  amount, 
  balance, 
  onAmountChange, 
  onTokenSelect, 
  onMax 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-nexus-900/50 rounded-2xl p-4 border border-gray-700/50 focus-within:border-nexus-accent/50 transition-colors">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-400">You send</span>
        <span className="text-sm text-gray-400">Balance: <span className="text-gray-200 font-mono">{balance}</span></span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-nexus-800 hover:bg-nexus-700 rounded-lg py-1.5 px-3 transition-colors border border-gray-700"
          >
            <span className="font-bold text-lg">{selectedToken.symbol}</span>
            <IconChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isOpen && (
            <div className="absolute top-full mt-2 left-0 min-w-[140px] bg-nexus-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => {
                    onTokenSelect(token);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-white/5 font-medium transition-colors"
                >
                  {token.symbol}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*\.?\d*$/.test(val)) {
              onAmountChange(val);
            }
          }}
          placeholder="0.0"
          className="flex-1 bg-transparent text-right text-3xl font-bold text-white outline-none placeholder-gray-600"
        />
      </div>
      
      <div className="flex justify-end mt-2">
        <button 
          onClick={onMax}
          className="text-xs font-semibold text-nexus-accent hover:text-nexus-accentHover uppercase tracking-wide"
        >
          Max Amount
        </button>
      </div>
    </div>
  );
};

export default TokenInput;
