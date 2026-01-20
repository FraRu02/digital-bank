import DashboardContent from '@/src/components/Dashboard/DashboardContent';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { createContext, useContext, useState } from 'react';
import BankAccount, { type BankAccountProps } from '@/src/classes/BankAccount';
import type { BaseCardProps } from '@/src/classes/Card';
import Card from '@/src/classes/Card';
import Transaction, { type BaseTransactionProps } from '@/src/classes/Transaction';

type DashboardViewContextProps = {
  cardsQuery: UseQueryResult<BaseCardProps[], Error>;
  bankAccountQuery: UseQueryResult<BankAccountProps | null, Error>;
  selectedCardQuery: UseQueryResult<BaseCardProps, Error>;
  incExpQuery: UseQueryResult<{inc: number, exp: number}, Error>;
  transactionsQuery: UseQueryResult<BaseTransactionProps[], Error>;
  selectedCard?: BaseCardProps; 
  setSelectedCard:  React.Dispatch<React.SetStateAction<BaseCardProps | undefined>>;
}
const DashboardViewContext = createContext<DashboardViewContextProps|undefined>(undefined);
export const useDashboardView = () => useContext(DashboardViewContext)!

const Dashboard = () => {
  const [selectedCard, setSelectedCard] = useState<BaseCardProps>();
  const cardsQuery = useQuery({
    queryKey: ["cards"],
    queryFn: Card.getMe
  });
  const selectedCardQuery = useQuery({
    queryKey: ["cards", selectedCard?.id],
    queryFn: () => Card.getMeById(selectedCard!.id),
    enabled: !!selectedCard,
  });
  const bankAccountQuery = useQuery({
    queryKey: ["bankAccount", selectedCard?.id],
    queryFn: () => {
      if(Card.isDebitType(selectedCard)) {
        return BankAccount.getMeById(selectedCard.bankAccountId);
      }
      return null;
    },
    enabled: !!selectedCard,
  });
  const incExpQuery = useQuery({
    queryKey: ["incExp", selectedCard?.id],
    queryFn: ({queryKey}) => {
      const [, cardId] = queryKey;
      return Card.getMeIncExp(cardId!);
    },
    enabled: !!selectedCard,
  });
  const transactionsQuery = useQuery({
    queryKey: ["transactions", selectedCard?.id],
    queryFn: ({queryKey}) => {
      const [, cardId] = queryKey;
      return Transaction.getByCardId(cardId!);
    },
    enabled: !!selectedCard,
  });

  const value:DashboardViewContextProps = {
    cardsQuery,
    bankAccountQuery,
    selectedCardQuery,
    incExpQuery,
    transactionsQuery,
    selectedCard,
    setSelectedCard
  }

  return (
    <DashboardViewContext.Provider value={value}>
      <DashboardContent />
    </DashboardViewContext.Provider>
  )
}

export default Dashboard