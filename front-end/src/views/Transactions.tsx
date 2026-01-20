import { createContext, useContext } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import Transaction, { type BaseTransactionProps } from '@/src/classes/Transaction';
import TransactionsContent from '@/src/components/Transactions/TransactionsContent';

type TransactionsViewContextProps = {
  transactionsQuery: UseQueryResult<BaseTransactionProps[], Error>
}
const TransactionsViewContext = createContext<TransactionsViewContextProps|undefined>(undefined);
export const useTransactionsView = () => useContext(TransactionsViewContext)!

const Transactions = () => {
  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: Transaction.getAll,
  });


  const value:TransactionsViewContextProps = {
    transactionsQuery
  }

  return (
    <TransactionsViewContext value={value}>
      <TransactionsContent />
    </TransactionsViewContext>
  )
}

export default Transactions