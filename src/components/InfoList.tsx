// import React from 'react';
// import { useEffect } from 'react'
// import {
//     useAppKitState,
//     useAppKitTheme,
//     useAppKitEvents,
//     useAppKitAccount,
//     useWalletInfo
//      } from '@reown/appkit/react'

// export const InfoList = () => {
//     const kitTheme = useAppKitTheme();
//     const state = useAppKitState();
//     const {address, caipAddress, isConnected, status, embeddedWalletInfo } = useAppKitAccount();
//     const eip155AccountState = useAppKitAccount({ namespace: 'eip155' })
//     const solanaAccountState = useAppKitAccount({ namespace: 'solana' })
//     //  const bip122AccountState = useAppKitAccount({ namespace: 'bip122' }) // for bitcoin
//     const events = useAppKitEvents()
//     const { walletInfo } = useWalletInfo()

//     useEffect(() => {
//         console.log("Events: ", events);
//     }, [events]);

//   return (
//     < >
//         <section>
//             <h2>All Addresses</h2>
//             <pre>
//                 Address EVM : {eip155AccountState.address}<br />
//                 Addresss Solana: {solanaAccountState.address}<br />
//             </pre>
//         </section>
//         <section>
//             <h2>useAppKit</h2>
//             <pre>
//                 Address: {address}<br />
//                 caip Address: {caipAddress}<br />
//                 Connected: {isConnected.toString()}<br />
//                 Status: {status}<br />
//                 Account Type: {embeddedWalletInfo?.accountType}<br />
//                 {embeddedWalletInfo?.user?.email && (`Email: ${embeddedWalletInfo?.user?.email}\n`)}
//                 {embeddedWalletInfo?.user?.username && (`Username: ${embeddedWalletInfo?.user?.username}\n`)}
//             </pre>
//         </section>

//         <section>
//             <h2>Theme</h2>
//             <pre>
//                 Theme: {kitTheme.themeMode}<br />
//             </pre>
//         </section>

//         <section>
//             <h2>State</h2>
//             <pre>
//                 activeChain: {state.activeChain}<br />
//                 loading: {state.loading.toString()}<br />
//                 open: {state.open.toString()}<br />
//                 selectedNetworkId: {state.selectedNetworkId?.toString()}<br />
//             </pre>
//         </section>

//         <section>
//             <h2>WalletInfo</h2>
//             <pre>
//                 Name: {JSON.stringify(walletInfo)}<br />
//             </pre>
//         </section>
//     </>
//   )
// }


import React from 'react';
import { 
    useAppKitState,
    useAppKitTheme,
    useAppKitEvents,
    useAppKitAccount,
    useWalletInfo
} from '@reown/appkit/react';

interface BackendUser {
    id?: string;
    username?: string;
    email?: string;
    wallet_address?: string;
    is_verified?: boolean;
    connections?: Array<{
        id: string;
        wallet_type: string;
        chain_id: string;
        connected_at: string;
    }>;
}

export const InfoList = ({ backendUser }: { backendUser?: BackendUser }) => {
    const kitTheme = useAppKitTheme();
    const state = useAppKitState();
    const {address, caipAddress, isConnected, status, embeddedWalletInfo } = useAppKitAccount();
    const eip155AccountState = useAppKitAccount({ namespace: 'eip155' });
    const solanaAccountState = useAppKitAccount({ namespace: 'solana' });
    const events = useAppKitEvents();
    const { walletInfo } = useWalletInfo();

    return (
        <>
            <section>
                <h2>Wallet Addresses</h2>
                <pre>
                    Frontend EVM: {eip155AccountState.address}<br />
                    Frontend Solana: {solanaAccountState.address}<br />
                    {backendUser?.wallet_address && (
                        <>Backend Verified: {backendUser.wallet_address}<br /></>
                    )}
                </pre>
            </section>

            {backendUser && (
                <section>
                    <h2>Backend User Info</h2>
                    <pre>
                        Username: {backendUser.username}<br />
                        Email: {backendUser.email}<br />
                        Verified: {backendUser.is_verified?.toString()}<br />
                        Connections: {backendUser.connections?.length || 0}<br />
                    </pre>
                </section>
            )}

            <section>
                <h2>Connection Status</h2>
                <pre>
                    Frontend Connected: {isConnected.toString()}<br />
                    Status: {status}<br />
                    Account Type: {embeddedWalletInfo?.accountType}<br />
                    {embeddedWalletInfo?.user?.email && (`Email: ${embeddedWalletInfo?.user?.email}\n`)}
                </pre>
            </section>

            <section>
                <h2>Wallet Info</h2>
                <pre>
                    Name: {JSON.stringify(walletInfo, null, 2)}<br />
                </pre>
            </section>
        </>
    );
};