import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { format } from "date-fns";
import { walletApi } from "../../../axiosconfig";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const response = await walletApi.get('/transactions/');
        console.log('this is the transaction api call: ',response.data)
        
        // Ensure transactions is an array, if not, convert to empty array
        const transactionData = response.data.transactions || [];
        setTransactions(transactionData);
        setWallet({ balance: response.data.wallet_balance || 0 });
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch wallet data');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading wallet data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">Balance: ₹{wallet?.balance || 0}</p>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.timestamp), "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.transaction_type}</TableCell>
                    <TableCell className="text-right">₹{transaction.amount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}