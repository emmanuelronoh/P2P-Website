import React from "react";
import { useState } from 'react';
import { useEscrow } from '../context/EscrowContext';
import { useUser } from './UserContext';

const CreateEscrowForm = () => {
    const { createEscrow } = useEscrow();
    const { users } = useUser();
    const [formData, setFormData] = useState({
        counterparty: '',
        token_contract: '0x1e0125b823dcDE430578068532E2dc400c56Fa82',
        token_amount: '',
        terms: '',
        release_conditions: ''
    });
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createEscrow(formData);
            setFormData({
                counterparty: '',
                token_contract: '0x1e0125b823dcDE430578068532E2dc400c56Fa82',
                token_amount: '',
                terms: '',
                release_conditions: ''
            });
        } catch (err) {
            console.error(err);
        }
    };
    
    return (
        <div className="escrow-form">
            <h2>Create New Escrow</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Counterparty</label>
                    <select
                        name="counterparty"
                        value={formData.counterparty}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a user</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username} ({user.wallet_address})
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Token</label>
                    <select
                        name="token_contract"
                        value={formData.token_contract}
                        onChange={handleChange}
                        required
                    >
                        <option value="0x1e0125b823dcDE430578068532E2dc400c56Fa82">Client Token</option>
                        <option value="0xB03b6d3D2bA12fA380aD04A79D80Aa58cc693299">Linked Token</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Amount</label>
                    <input
                        type="number"
                        name="token_amount"
                        value={formData.token_amount}
                        onChange={handleChange}
                        step="any"
                        min="0"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Terms</label>
                    <textarea
                        name="terms"
                        value={formData.terms}
                        onChange={handleChange}
                        rows="3"
                    />
                </div>
                
                <div className="form-group">
                    <label>Release Conditions</label>
                    <textarea
                        name="release_conditions"
                        value={formData.release_conditions}
                        onChange={handleChange}
                        rows="3"
                        required
                    />
                </div>
                
                <button type="submit">Create Escrow</button>
            </form>
        </div>
    );
};

export default CreateEscrowForm;
