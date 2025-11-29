
import React from 'react';
import { IconWallet, IconSettings } from './Icons';

interface HeaderProps {
  onConnect: () => void;
  isConnected: boolean;
  walletAddress?: string;
}

const Header: React.FC<HeaderProps> = ({ onConnect, isConnected, walletAddress }) => {
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="flex justify-between items-center py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-xl">N</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-white hidden sm:block">Nexus<span className="text-nexus-accent">Bridge</span></span>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-nexus-accent">
          <IconSettings className="w-5 h-5" />
        </button>
        
        <button
          onClick={onConnect}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
            isConnected
              ? 'bg-nexus-800 text-nexus-accent border border-nexus-accent/30'
              : 'bg-nexus-accent hover:bg-nexus-accentHover text-white shadow-lg shadow-nexus-accent/20'
          }`}
        >
          <IconWallet className="w-4 h-4" />
          {isConnected && walletAddress ? formatAddress(walletAddress) : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};

export default Header;
