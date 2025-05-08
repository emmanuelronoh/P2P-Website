// // src/pages/DApp.tsx
// import React from 'react';
// import { createAppKit } from '@reown/appkit/react'
// import { WagmiProvider } from 'wagmi'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ActionButtonList } from '../components/ActionButtonList'
// import { InfoList } from '../components/InfoList'
// import { projectId, metadata, networks, wagmiAdapter, solanaWeb3JsAdapter } from '../config'
// import "./DApp.css"

// const queryClient = new QueryClient()

// const generalConfig = {
//   projectId,
//   metadata,
//   networks,
//   themeMode: 'light' as const,
//   features: {
//     analytics: true
//   },
//   themeVariables: {
//     '--w3m-accent': '#000000',
//   }
// }

// // Create modal
// createAppKit({
//   adapters: [wagmiAdapter, solanaWeb3JsAdapter],
//   ...generalConfig,
// })

// export function DApp() {
//   return (
//     <div className="pages">
//       <h1>AppKit Wagmi+Solana React dApp Example</h1>
//       <WagmiProvider config={wagmiAdapter.wagmiConfig}>
//         <QueryClientProvider client={queryClient}>
//           <appkit-button />
//           <ActionButtonList />
//           <div className="advice">
//             <p>
//               This projectId only works on localhost. <br />
//               Go to <a href="https://cloud.reown.com" target="_blank" rel="noreferrer" className="link-button">Reown Cloud</a> to get your own.
//             </p>
//           </div>
//           <InfoList />
//         </QueryClientProvider>
//       </WagmiProvider>
//     </div>
//   );
// }

// export default DApp;


// src/pages/DApp.tsx
import React, { useEffect, useState } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActionButtonList } from '../components/ActionButtonList';
import { InfoList } from '../components/InfoList';
import { ThemeMode } from '@reown/appkit';
import { projectId, metadata, networks, wagmiAdapter, solanaWeb3JsAdapter } from '../config';
import { useAuth } from '../hooks/useAuth';
import "./DApp.css";

const queryClient = new QueryClient();

const generalConfig = {
  projectId: "e18a79a950656245e5f814b1881481fa",
  metadata,
  networks,
  themeMode: 'light' as ThemeMode,
  features: {
    analytics: false,
  },
  themeVariables: {
    '--w3m-accent': '#000000',
  }
};


// Create modal
createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  ...generalConfig,
});

export function DApp() {
  const { isAuthenticated, user, handleWalletConnect } = useAuth();
  const [backendConnected, setBackendConnected] = useState(false);

  // Handle wallet connection events
  useEffect(() => {
    const handleConnection = async () => {
      if (isAuthenticated && user?.walletAddress) {
        setBackendConnected(true);
      }
    };
    handleConnection();
  }, [isAuthenticated, user]);

  return (
    <div className="pages">
      <h1>AppKit Wagmi+Solana React dApp Example</h1>
      <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <div className="connection-status">
            {backendConnected ? (
              <div className="connected-badge">
                ✅ Backend Connected ({user?.walletAddress.slice(0, 6)}...{user?.walletAddress.slice(-4)})
              </div>
            ) : (
              <div className="disconnected-badge">
                ⚠️ Not connected to backend
              </div>
            )}
          </div>
          
          <appkit-button />
          <ActionButtonList onConnect={handleWalletConnect} />
      
          
          <InfoList backendUser={user} />
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

export default DApp;