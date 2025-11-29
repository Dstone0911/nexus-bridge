
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ChainSelector from './components/ChainSelector';
import TokenInput from './components/TokenInput';
import { IconArrowSwitch, IconLoader, IconInfo } from './components/Icons';
import { CHAINS, TOKENS, LZ_ENDPOINTS } from './constants';
import { DEPLOY_ABI, DEPLOY_BYTECODE } from './deployConfig';
import { Chain, Token, BridgeState, TransactionQuote } from './types';
import { ethers, BrowserProvider, Contract, ContractFactory, formatUnits, parseUnits, ZeroAddress, MaxUint256 } from 'ethers';

// Add global window declaration for Ethereum provider
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Helper to convert chainId to hex
const toHex = (num: number) => `0x${num.toString(16)}`;

const App: React.FC = () => {
  // Web3 State
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [currentChainId, setCurrentChainId] = useState<number>(0);

  // App State
  const [sourceChain, setSourceChain] = useState<Chain>(CHAINS[4]); // Default to Goerli
  const [destChain, setDestChain] = useState<Chain>(CHAINS[0]);   // Default to Mainnet
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0.0');
  const [minSendAmount, setMinSendAmount] = useState<bigint>(BigInt(0));
  const [needsApproval, setNeedsApproval] = useState(false);
  const [bridgeState, setBridgeState] = useState<BridgeState>(BridgeState.IDLE);
  const [quote, setQuote] = useState<TransactionQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Deployment State
  const [isDeploying, setIsDeploying] = useState(false);
  const [isContractDeployed, setIsContractDeployed] = useState(true);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

  // Helper to get current token address based on chain
  const getCurrentTokenAddress = useCallback((chain: Chain, token: Token) => {
    return token.addresses[chain.id] || ZeroAddress;
  }, []);

  // Initialize Provider Listeners
  useEffect(() => {
    if (window.ethereum) {
      const providerInstance = new BrowserProvider(window.ethereum);
      setProvider(providerInstance);

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) setUserAddress(accounts[0]);
        else setUserAddress('');
      });

      window.ethereum.on('chainChanged', (_chainId: string) => {
        window.location.reload();
      });
    }
  }, []);

  // Sync Chain and Initialize Data
  useEffect(() => {
    const initData = async () => {
      if (provider) {
        try {
          const _signer = await provider.getSigner();
          setSigner(_signer);
          
          const accounts = await provider.listAccounts();
          if (accounts.length > 0 && !userAddress) {
             setUserAddress(accounts[0].address);
          }

          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          setCurrentChainId(chainId);

          const supportedChain = CHAINS.find(c => c.id === chainId);
          if (supportedChain && supportedChain.id !== sourceChain.id) {
            setSourceChain(supportedChain);
          } 
          
          if (supportedChain && chainId === supportedChain.id) {
            fetchChainData(_signer, supportedChain);
          }
        } catch (e) {
          console.error("Initialization error", e);
        }
      }
    };
    initData();
  }, [provider, userAddress]);

  // Fetch Balance, MinAmount, Allowance, and Check Deployment
  const fetchChainData = async (signerInstance: ethers.JsonRpcSigner, chain: Chain = sourceChain) => {
    try {
      setError(null);
      // Reset logic
      const tokenAddress = getCurrentTokenAddress(chain, selectedToken);
      const isPlaceholder = !tokenAddress || tokenAddress === ZeroAddress || tokenAddress.toLowerCase() === ZeroAddress.toLowerCase();

      // Force deployment mode if placeholder on testnet
      if (isPlaceholder) {
        setIsContractDeployed(false);
        setBalance("0.0");
        return;
      }

      // Check code
      const code = await provider!.getCode(tokenAddress);
      if (code === '0x') {
        setIsContractDeployed(false);
        if (chain.type === 'mainnet') {
            setError("Contract not deployed on this network.");
        }
        setBalance("0.0");
        return;
      }

      setIsContractDeployed(true);

      if (selectedToken.isNative) {
        const bal = await provider!.getBalance(await signerInstance.getAddress());
        setBalance(Number(formatUnits(bal, 18)).toFixed(4));
      } else {
        const contract = new Contract(tokenAddress, selectedToken.abi, signerInstance);
        const bal = await contract.balanceOf(await signerInstance.getAddress());
        setBalance(Number(formatUnits(bal, selectedToken.decimals)).toFixed(4));
      }

      const contract = new Contract(tokenAddress, selectedToken.abi, signerInstance);
      try {
        const min = await contract.minSendAmount();
        setMinSendAmount(min);
      } catch (e) {
        setMinSendAmount(BigInt(0));
      }

      if (!selectedToken.isNative && amount) {
        const amtWei = parseUnits(amount, selectedToken.decimals);
        const allowance = await contract.allowance(userAddress, tokenAddress); 
        setNeedsApproval(allowance < amtWei);
      } else {
        setNeedsApproval(false);
      }

    } catch (err) {
      console.error("Error fetching chain data:", err);
    }
  };

  // Connect Wallet
  const connect = async () => {
    setError(null);
    if (!window.ethereum) {
      setError("No crypto wallet found.");
      return;
    }
    try {
      const providerInstance = new BrowserProvider(window.ethereum);
      setProvider(providerInstance);
      const accounts = await providerInstance.send("eth_requestAccounts", []);
      if (accounts.length > 0) setUserAddress(accounts[0]);
    } catch (err: any) {
      setError("Failed to connect wallet.");
    }
  };

  // Switch Network
  const switchNetwork = async (chain: Chain) => {
    if (!provider && !window.ethereum) return;
    const p = provider || new BrowserProvider(window.ethereum);

    try {
      await p.send("wallet_switchEthereumChain", [{ chainId: toHex(chain.id) }]);
      setSourceChain(chain);
      setTimeout(async () => {
          const s = await p.getSigner();
          setSigner(s);
          fetchChainData(s, chain);
      }, 1000);
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await p.send("wallet_addEthereumChain", [{
            chainId: toHex(chain.id),
            chainName: chain.name,
            rpcUrls: [chain.rpcUrl],
            nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
            blockExplorerUrls: []
          }]);
          setSourceChain(chain);
        } catch (addError) {
          setError("Failed to add network.");
        }
      }
    }
  };

  const handleSwitchChains = () => {
    setSourceChain(destChain);
    setDestChain(sourceChain);
    if (userAddress) switchNetwork(destChain);
  };

  // Deploy Contract
  const handleDeploy = async () => {
    if (!signer) return;
    setError(null);
    setIsDeploying(true);

    try {
        const lzEndpoint = LZ_ENDPOINTS[sourceChain.id];
        if (!lzEndpoint) throw new Error(`LZ Endpoint not found for ${sourceChain.name}`);

        const factory = new ContractFactory(DEPLOY_ABI, DEPLOY_BYTECODE, signer);
        const minAmount = parseUnits("0.0001", 18);
        const contract = await factory.deploy("Native " + sourceChain.name + " ETH", "N" + sourceChain.symbol, lzEndpoint, minAmount);
        
        await contract.waitForDeployment();
        const address = await contract.getAddress();
        
        setDeployedAddress(address);
        setIsContractDeployed(true);
        fetchChainData(signer, sourceChain);
    } catch (err: any) {
        setError("Deployment failed: " + (err.reason || err.message));
    } finally {
        setIsDeploying(false);
    }
  };

  // Estimate Fee
  useEffect(() => {
    const getEstimate = async () => {
      setQuote(null);
      setError(null);

      if (!amount || parseFloat(amount) === 0 || !provider || !sourceChain || !destChain) return;
      if (!isContractDeployed) return;

      const tokenAddress = getCurrentTokenAddress(sourceChain, selectedToken);
      if (!tokenAddress || tokenAddress === ZeroAddress) return;
      if (currentChainId !== sourceChain.id) return;

      try {
        const contract = new Contract(tokenAddress, selectedToken.abi, provider);
        const adapterParams = ethers.solidityPacked(['uint16', 'uint256'], [1, 200000]);
        const toAddressBytes = ethers.solidityPacked(['address'], [userAddress]);
        const amountWei = parseUnits(amount, selectedToken.decimals);

        if (amountWei < minSendAmount) {
            setError(`Min amount: ${formatUnits(minSendAmount, selectedToken.decimals)}`);
            return;
        }

        const [nativeFee, zroFee] = await contract.estimateSendFee(
          destChain.lzChainId,
          toAddressBytes,
          amountWei,
          false,
          adapterParams
        );

        setQuote({
          nativeFee: formatUnits(nativeFee, 18),
          zroFee: formatUnits(zroFee, 18),
          amount: amount,
          estimatedReceived: amount 
        });
      } catch (err: any) {
        // Silent fail on estimation during initial render to prevent flickering
        console.warn("Estimation failed", err);
      }
    };

    const timer = setTimeout(getEstimate, 800);
    return () => clearTimeout(timer);
  }, [amount, sourceChain, destChain, selectedToken, currentChainId, provider, userAddress, getCurrentTokenAddress, minSendAmount, signer, isContractDeployed]);

  // Bridge Logic
  const handleBridge = async () => {
    if (!signer || !quote) return;
    setError(null);

    if (currentChainId !== sourceChain.id) {
        await switchNetwork(sourceChain);
        return;
    }

    const tokenAddress = getCurrentTokenAddress(sourceChain, selectedToken);
    try {
      const contract = new Contract(tokenAddress, selectedToken.abi, signer);
      const amountWei = parseUnits(amount, selectedToken.decimals);
      const adapterParams = ethers.solidityPacked(['uint16', 'uint256'], [1, 200000]);
      const toAddressBytes = ethers.solidityPacked(['address'], [userAddress]);
      const nativeFeeWei = parseUnits(quote.nativeFee, 18);

      setBridgeState(BridgeState.BRIDGING);

      let valueToSend = nativeFeeWei;
      if (selectedToken.isNative) valueToSend += amountWei;

      const tx = await contract.sendFrom(
        userAddress, 
        destChain.lzChainId, 
        toAddressBytes, 
        amountWei, 
        { refundAddress: userAddress, zroPaymentAddress: ZeroAddress, adapterParams: adapterParams }, 
        { value: valueToSend }
      );

      await tx.wait();
      setBridgeState(BridgeState.COMPLETED);
      if (signer) fetchChainData(signer, sourceChain);
      setTimeout(() => { setBridgeState(BridgeState.IDLE); setAmount(''); setQuote(null); }, 3000);

    } catch (err: any) {
      setBridgeState(BridgeState.FAILED);
      setError(err.reason || err.message || "Transaction failed");
      setTimeout(() => setBridgeState(BridgeState.IDLE), 3000);
    }
  };

  const handleApprove = async () => {
    if (!signer) return;
    setBridgeState(BridgeState.APPROVING);
    try {
        const tokenAddress = getCurrentTokenAddress(sourceChain, selectedToken);
        const contract = new Contract(tokenAddress, selectedToken.abi, signer);
        const tx = await contract.approve(tokenAddress, MaxUint256);
        await tx.wait();
        setNeedsApproval(false);
        setBridgeState(BridgeState.IDLE);
    } catch (err) {
        setBridgeState(BridgeState.FAILED);
        setError("Approval failed");
        setTimeout(() => setBridgeState(BridgeState.IDLE), 2000);
    }
  };

  // --- UI RENDER LOGIC ---
  const currentTokenAddr = getCurrentTokenAddress(sourceChain, selectedToken);
  // Ensure case-insensitive check for ZeroAddress string
  const isPlaceholderAddress = !currentTokenAddr || currentTokenAddr === ZeroAddress || currentTokenAddr.toLowerCase() === ZeroAddress.toLowerCase();
  
  // CRITICAL: Determine if we should show deployment UI
  const shouldShowDeploy = userAddress && sourceChain.type === 'testnet' && (isPlaceholderAddress || !isContractDeployed);

  const getButtonText = () => {
    if (currentChainId !== sourceChain.id && userAddress) return `Switch to ${sourceChain.name}`;
    
    // Only show fatal "Not Supported" if we are on Mainnet. 
    if (isPlaceholderAddress && sourceChain.type === 'mainnet') return 'Token Not Supported';
    
    // Fallback if Deploy UI logic fails but we know it's a testnet placeholder
    if (isPlaceholderAddress && sourceChain.type === 'testnet') return 'Deploy Contract';

    if (needsApproval) return 'Approve Token';

    switch (bridgeState) {
      case BridgeState.APPROVING: return 'Approving...';
      case BridgeState.BRIDGING: return 'Confirming...';
      case BridgeState.COMPLETED: return 'Success!';
      case BridgeState.FAILED: return 'Failed';
      case BridgeState.ESTIMATING: return 'Estimating...';
      default: return quote ? `Bridge ${selectedToken.symbol}` : 'Enter Amount';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-nexus-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-nexus-800 to-nexus-900 text-gray-100">
      <Header onConnect={connect} isConnected={!!userAddress} walletAddress={userAddress} />

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <div className="w-full max-w-[480px] glass-panel rounded-3xl p-2 sm:p-4 shadow-2xl shadow-black/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nexus-accent to-transparent opacity-50"></div>

          <div className="p-4 flex flex-col gap-6">
            <div className="flex items-center gap-2 relative">
              <ChainSelector 
                label="From" 
                chains={CHAINS} 
                selectedChain={sourceChain} 
                onSelect={(c) => { setSourceChain(c); if(userAddress) switchNetwork(c); }}
                disabled={bridgeState !== BridgeState.IDLE}
              />
              <button onClick={handleSwitchChains} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[-4px] p-2 bg-nexus-700 border-4 border-nexus-900 rounded-full hover:bg-nexus-600 z-10"><IconArrowSwitch className="w-4 h-4 text-nexus-accent" /></button>
              <ChainSelector 
                label="To" 
                chains={CHAINS} 
                selectedChain={destChain} 
                onSelect={setDestChain}
                disabled={bridgeState !== BridgeState.IDLE}
              />
            </div>

            <TokenInput 
              tokens={TOKENS}
              selectedToken={selectedToken}
              amount={amount}
              balance={balance}
              onAmountChange={setAmount}
              onTokenSelect={setSelectedToken}
              onMax={() => setAmount(balance)}
            />

            {quote && (
              <div className="bg-nexus-800/50 rounded-xl p-4 border border-gray-700/50 space-y-3 animate-fade-in">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-1"><IconInfo className="w-3 h-3" /> Estimate</span>
                  <span className="font-medium text-xs text-nexus-accent">LayerZero V1</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Gas Cost</span>
                  <span className="font-medium text-gray-200">~{Number(quote.nativeFee).toFixed(5)} {sourceChain.symbol}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-700/50">
                  <span className="text-gray-300 font-medium">You Receive</span>
                  <span className="text-nexus-accent font-bold text-lg">{quote.estimatedReceived} {selectedToken.symbol}</span>
                </div>
              </div>
            )}

            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center animate-fade-in">{error}</div>}

            {/* ACTION AREA */}
            {shouldShowDeploy ? (
                <div className="flex flex-col gap-3 animate-fade-in">
                    <div className="text-xs text-yellow-400 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20 text-center">
                        Contract missing on {sourceChain.name}.
                    </div>
                    <button 
                        onClick={handleDeploy}
                        disabled={isDeploying}
                        className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {isDeploying && <IconLoader className="w-5 h-5 animate-spin" />}
                        {isDeploying ? 'Deploying...' : `Deploy on ${sourceChain.name}`}
                    </button>
                </div>
            ) : (
                !userAddress ? (
                    <button onClick={connect} className="w-full py-4 rounded-xl bg-nexus-accent hover:bg-nexus-accentHover text-white font-bold text-lg shadow-lg shadow-nexus-accent/20 transition-all duration-200">Connect Wallet</button>
                ) : (
                    <button
                        disabled={!quote || bridgeState !== BridgeState.IDLE || (currentChainId !== sourceChain.id)}
                        onClick={currentChainId !== sourceChain.id ? () => switchNetwork(sourceChain) : (needsApproval ? handleApprove : handleBridge)}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                        (bridgeState !== BridgeState.IDLE || !quote) && currentChainId === sourceChain.id
                            ? 'bg-nexus-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-nexus-accent hover:to-blue-400 text-white shadow-blue-500/20'
                        }`}
                    >
                        {bridgeState !== BridgeState.IDLE && bridgeState !== BridgeState.COMPLETED && bridgeState !== BridgeState.FAILED && <IconLoader className="w-5 h-5 animate-spin" />}
                        {getButtonText()}
                    </button>
                )
            )}

            {deployedAddress && (
                <div className="mt-2 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-200 text-xs break-all animate-fade-in">
                    <strong className="block mb-1">New Contract Address:</strong>
                    <div className="font-mono bg-black/20 p-1 rounded select-all">{deployedAddress}</div>
                    <div className="mt-2 opacity-75">Update constants.ts with this address for Chain {sourceChain.id}</div>
                </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 max-w-md">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            Powered by LayerZero
          </p>
          <div className="flex justify-center gap-2 text-xs text-gray-600">
            <span>
              Contract: 
              {currentTokenAddr && currentTokenAddr !== ZeroAddress
                ? ` ${currentTokenAddr.substring(0,6)}...` 
                : ' N/A'}
            </span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;
