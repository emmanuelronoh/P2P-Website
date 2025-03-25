import React, { useState, useEffect } from 'react';
import styles from '../styles/Wallet.module.css';

const Wallet = ({ currentUser }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('deposit');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch wallet balance and transaction history from API (mocked for now)
    setBalance(5000); // Example initial balance
    setTransactions([
      { id: 1, type: 'deposit', amount: 2000, date: '2025-03-20' },
      { id: 2, type: 'withdraw', amount: 1000, date: '2025-03-21' },
    ]);
  }, []);

  const handleTransaction = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Invalid amount entered.');
      return;
    }
    if (transactionType === 'withdraw' && parsedAmount > balance) {
      setErrorMessage('Insufficient balance.');
      return;
    }
    
    const newTransaction = {
      id: transactions.length + 1,
      type: transactionType,
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0],
    };

    setTransactions([newTransaction, ...transactions]);
    setBalance(transactionType === 'deposit' ? balance + parsedAmount : balance - parsedAmount);
    setAmount('');
    setSuccessMessage(`Successfully ${transactionType}ed ${parsedAmount} KES.`);
    setErrorMessage('');
  };

  return (
    <div className={styles.walletContainer}>
      <h2>My Wallet</h2>
      <p className={styles.balance}>Balance: {balance} KES</p>

      <form onSubmit={handleTransaction} className={styles.transactionForm}>
        <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
        </select>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

      <h3>Transaction History</h3>
      {transactions.length > 0 ? (
        <ul className={styles.transactionList}>
          {transactions.map((txn) => (
            <li key={txn.id} className={txn.type === 'deposit' ? styles.deposit : styles.withdraw}>
              <span>{txn.type.toUpperCase()}</span> - {txn.amount} KES on {txn.date}
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions yet.</p>
      )}
    </div>
  );
};

export default Wallet;
