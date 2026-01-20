import { createContext, useContext } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import BankAccount, { type BankAccountProps } from '@/src/classes/BankAccount';
import BankAccountsContent from '@/src/components/BankAccounts/BankAccountsContent';

type BankAccountsViewContextProps = {
  bankAccountsQuery: UseQueryResult<BankAccountProps[], Error>
}
const BankAccountsViewContext = createContext<BankAccountsViewContextProps|undefined>(undefined);
export const useBankAccountsView = () => useContext(BankAccountsViewContext)!

const BankAccounts = () => {
  const bankAccountsQuery = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: BankAccount.getAll,
  });


  const value:BankAccountsViewContextProps = {
    bankAccountsQuery
  }

  return (
    <BankAccountsViewContext value={value}>
      <BankAccountsContent />
    </BankAccountsViewContext>
  )
}

export default BankAccounts