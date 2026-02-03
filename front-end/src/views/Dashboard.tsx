import DashboardContent from '@/src/components/Dashboard/DashboardContent';
import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';
import { createContext, useContext, useMemo, useState } from 'react';
import BankAccount, { type BankAccountProps } from '@/src/classes/BankAccount';
import type { BaseCardProps } from '@/src/classes/Card';
import Card from '@/src/classes/Card';
import Transaction, { type BaseTransactionProps } from '@/src/classes/Transaction';

type DashboardViewContextProps = {
  cardsQuery: UseQueryResult<BaseCardProps[], Error>;
  fetchSingleCard: UseMutationResult<BaseCardProps, Error, string, unknown>;
  bankAccountQuery: UseQueryResult<BankAccountProps | null, Error>;
  incExpQuery: UseQueryResult<{inc: number, exp: number}, Error>;
  transactionsQuery: UseQueryResult<BaseTransactionProps[], Error>;
  selectedCardId?: string;
  setSelectedCardId:  React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedCard?: BaseCardProps;
  cardToVerifyId: string|null; 
  setCardToVerifyId: React.Dispatch<React.SetStateAction<string | null>>;
  cardToVerify: BaseCardProps|null; 

}
const DashboardViewContext = createContext<DashboardViewContextProps|undefined>(undefined);
export const useDashboardView = () => useContext(DashboardViewContext)!

const Dashboard = () => {
  const queryClient = useQueryClient()
  const [selectedCardId, setSelectedCardId] = useState<string>();
  const [cardToVerifyId, setCardToVerifyId] = useState<string|null>(null);
  const cardsQuery = useQuery({
    queryKey: ["cards"],
    queryFn: Card.getMe
  });
  const selectedCard = useMemo(() => {
    const newSelected = cardsQuery.data?.find((e) => e.id === selectedCardId);
    if(newSelected) localStorage.setItem("selectedCardId", newSelected.id);
    return newSelected;
  }, [cardsQuery.data, selectedCardId])

  const cardToVerify = useMemo(() => {
    return cardsQuery.data?.find((e) => e.id === cardToVerifyId) ?? null;
  }, [cardsQuery.data, cardToVerifyId])

  const fetchSingleCard = useMutation({
    mutationFn: (cardId: string) => Card.getMeById(cardId),
    onSuccess: (updatedCard) => {
      queryClient.setQueryData<BaseCardProps[]>(["cards"], (old) => {
        if (!old) return old;

        return old.map(card =>
          card.id === updatedCard.id ? updatedCard : card
        );
      });
    },
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
    fetchSingleCard,
    bankAccountQuery,
    incExpQuery,
    transactionsQuery,
    selectedCardId, setSelectedCardId,
    selectedCard,
    cardToVerifyId, setCardToVerifyId,
    cardToVerify
  }

  return (
    <DashboardViewContext.Provider value={value}>
      <DashboardContent />
    </DashboardViewContext.Provider>
  )
}

export default Dashboard