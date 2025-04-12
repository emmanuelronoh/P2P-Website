import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const EscrowContext = createContext();

export const EscrowProvider = ({ children }) => {
    const [escrows, setEscrows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchEscrows = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/escrow/');
            setEscrows(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch escrows');
        } finally {
            setLoading(false);
        }
    };
    
    const createEscrow = async (data) => {
        setLoading(true);
        try {
            const response = await axios.post('/api/escrow/', data);
            setEscrows(prev => [response.data, ...prev]);
            setError(null);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create escrow');
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const verifyFunding = async (escrowId) => {
        setLoading(true);
        try {
            await axios.post(`/api/escrow/${escrowId}/verify_funding/`);
            await fetchEscrows();
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to verify funding');
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const releaseFunds = async (escrowId) => {
        setLoading(true);
        try {
            await axios.post(`/api/escrow/${escrowId}/release/`);
            await fetchEscrows();
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to release funds');
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const refundFunds = async (escrowId) => {
        setLoading(true);
        try {
            await axios.post(`/api/escrow/${escrowId}/refund/`);
            await fetchEscrows();
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to refund funds');
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const disputeEscrow = async (escrowId) => {
        setLoading(true);
        try {
            await axios.post(`/api/escrow/${escrowId}/dispute/`);
            await fetchEscrows();
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to dispute escrow');
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchEscrows();
    }, []);
    
    return (
        <EscrowContext.Provider value={{
            escrows,
            loading,
            error,
            createEscrow,
            verifyFunding,
            releaseFunds,
            refundFunds,
            disputeEscrow,
            refreshEscrows: fetchEscrows
        }}>
            {children}
        </EscrowContext.Provider>
    );
};

export const useEscrow = () => useContext(EscrowContext);