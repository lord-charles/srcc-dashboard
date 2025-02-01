import WalletPage from '@/components/wallet/wallet-component';
import { getPaymentTransactions, getWalletTransactions } from '@/services/wallet-service'
import React from 'react'

export default async function Wallet() {
    // const [
    //   transactionsResponse, mpesaPayments
    // ] = await Promise.all([
    //   getWalletTransactions(),
    //   getPaymentTransactions()
    // ]);
  return (
    <div>
      {/* <WalletPage transactions={transactionsResponse.data} mpesaPayments={mpesaPayments}/> */}
    </div>
  )
}

