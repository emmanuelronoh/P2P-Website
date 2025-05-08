//config/index.tsx
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { 
  mainnet, 
  arbitrum, 
  solana, 
  solanaDevnet, 
  solanaTestnet 
} from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';

// Get projectId from https://cloud.reown.com
export const projectId = "e18a79a950656245e5f814b1881481fa"; // Fallback for localhost

if (!projectId || typeof projectId !== 'string') {
  throw new Error('Valid Project ID is required');
}

export const metadata = {
  name: 'CheetahX',
  description: 'Cheetahx is a system for p2p payments',
  url: 'https://p2p-frontend-zfe9.vercel.app/', 
  icons: ['https://imagedelivery.net/_aTEfDRm7z3tKgu9JhfeKA/809b3643-aa12-4aa6-cb38-cc4d3b34e900/sm']
};

// Network configuration
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet, 
  arbitrum, 
  solana, 
  solanaDevnet, 
  solanaTestnet
];

// Wagmi adapter configuration
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  // Optional: add more wagmi-specific config here
});

// Solana adapter
export const solanaWeb3JsAdapter = new SolanaAdapter();

// Export combined config
export const config = wagmiAdapter.wagmiConfig;