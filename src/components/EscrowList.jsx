import { useEscrow } from '../context/EscrowContext';
import { useUser } from '../context/UserContext';

const EscrowList = () => {
    const { escrows, loading, error, verifyFunding, releaseFunds, refundFunds, disputeEscrow } = useEscrow();
    const { user } = useUser();
    
    const handleVerifyFunding = async (escrowId) => {
        if (window.confirm('Have you sent the funds to the escrow wallet?')) {
            await verifyFunding(escrowId);
        }
    };
    
    const handleRelease = async (escrowId) => {
        if (window.confirm('Are you sure you want to release the funds to the counterparty?')) {
            await releaseFunds(escrowId);
        }
    };
    
    const handleRefund = async (escrowId) => {
        if (window.confirm('Are you sure you want to refund the funds to the initiator?')) {
            await refundFunds(escrowId);
        }
    };
    
    const handleDispute = async (escrowId) => {
        if (window.confirm('Are you sure you want to dispute this escrow?')) {
            await disputeEscrow(escrowId);
        }
    };
    
    if (loading) return <div>Loading escrows...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div className="escrow-list">
            <h2>Your Escrow Transactions</h2>
            {escrows.length === 0 ? (
                <p>No escrow transactions found.</p>
            ) : (
                <ul>
                    {escrows.map(escrow => (
                        <li key={escrow.id} className={`escrow-item status-${escrow.status}`}>
                            <div className="escrow-header">
                                <span>Transaction ID: {escrow.transaction_id}</span>
                                <span className={`status-badge ${escrow.status}`}>
                                    {escrow.status.toUpperCase()}
                                </span>
                            </div>
                            
                            <div className="escrow-details">
                                <p><strong>Initiator:</strong> {escrow.initiator.username}</p>
                                <p><strong>Counterparty:</strong> {escrow.counterparty.username}</p>
                                <p><strong>Token:</strong> {escrow.token_contract}</p>
                                <p><strong>Amount:</strong> {escrow.token_amount}</p>
                                <p><strong>Terms:</strong> {escrow.terms || 'None specified'}</p>
                                <p><strong>Release Conditions:</strong> {escrow.release_conditions}</p>
                                
                                {escrow.funding_tx_hash && (
                                    <p><strong>Funding TX:</strong> 
                                        <a href={`https://bscscan.com/tx/${escrow.funding_tx_hash}`} target="_blank" rel="noopener noreferrer">
                                            View on BscScan
                                        </a>
                                    </p>
                                )}
                                
                                {escrow.release_tx_hash && (
                                    <p><strong>Release TX:</strong> 
                                        <a href={`https://bscscan.com/tx/${escrow.release_tx_hash}`} target="_blank" rel="noopener noreferrer">
                                            View on BscScan
                                        </a>
                                    </p>
                                )}
                                
                                {escrow.refund_tx_hash && (
                                    <p><strong>Refund TX:</strong> 
                                        <a href={`https://bscscan.com/tx/${escrow.refund_tx_hash}`} target="_blank" rel="noopener noreferrer">
                                            View on BscScan
                                        </a>
                                    </p>
                                )}
                            </div>
                            
                            <div className="escrow-actions">
                                {escrow.status === 'pending' && escrow.initiator.id === user.id && (
                                    <button onClick={() => handleVerifyFunding(escrow.id)}>
                                        Verify Funding
                                    </button>
                                )}
                                
                                {escrow.status === 'funded' && escrow.counterparty.id === user.id && (
                                    <button onClick={() => handleRelease(escrow.id)}>
                                        Release Funds
                                    </button>
                                )}
                                
                                {escrow.status === 'funded' && escrow.initiator.id === user.id && (
                                    <button onClick={() => handleRefund(escrow.id)}>
                                        Refund Funds
                                    </button>
                                )}
                                
                                {(escrow.status === 'pending' || escrow.status === 'funded') && (
                                    <button className="dispute-btn" onClick={() => handleDispute(escrow.id)}>
                                        Dispute
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default EscrowList;