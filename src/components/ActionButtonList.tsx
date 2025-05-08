// import React from 'react';
// import { useDisconnect, useAppKit, useAppKitNetwork  } from '@reown/appkit/react'
// import { networks } from '../config'

// export const ActionButtonList = () => {
//     const { disconnect } = useDisconnect();
//     const { open } = useAppKit();
//     const { switchNetwork } = useAppKitNetwork();

//     const handleDisconnect = async () => {
//       try {
//         await disconnect();
//       } catch (error) {
//         console.error("Failed to disconnect:", error);
//       }
//     };
//   return (
//     <div >
//         <button onClick={() => open({ view: 'Connect', namespace: 'eip155' })}>Open EVM</button>
//         <button onClick={() => open({ view: 'Connect', namespace: 'solana' })}>Open Solana</button>
//         <button onClick={handleDisconnect}>Disconnect</button>
//         <button onClick={() => switchNetwork(networks[1]) }>Switch</button>
//     </div>
//   )
// }

import React from 'react';
import { useDisconnect, useAppKit, useAppKitNetwork } from '@reown/appkit/react';
import { networks } from '../config';

export const ActionButtonList = ({ onConnect }: { onConnect: () => void }) => {
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const { switchNetwork } = useAppKitNetwork();

    const handleDisconnect = async () => {
        try {
            await disconnect();
            // You might want to call backend logout here too
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    };

    return (
        <div className="action-buttons">
            <button onClick={() => open({ view: 'Connect', namespace: 'eip155' })}>
                Connect EVM
            </button>
            <button onClick={() => open({ view: 'Connect', namespace: 'solana' })}>
                Connect Solana
            </button>
            <button onClick={onConnect} className="primary">
                Verify with Backend
            </button>
            <button onClick={handleDisconnect} className="danger">
                Disconnect
            </button>
            <button onClick={() => switchNetwork(networks[1])}>
                Switch Network
            </button>
        </div>
    );
};