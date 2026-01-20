import { createContext, useContext } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import Card, { type BaseCardProps } from '@/src/classes/Card';
import CardsContent from '@/src/components/Cards/CardsContent';

type CardsViewContextProps = {
  cardsQuery: UseQueryResult<BaseCardProps[], Error>
}
const CardsViewContext = createContext<CardsViewContextProps|undefined>(undefined);
export const useCardsView = () => useContext(CardsViewContext)!

const Cards = () => {
  const cardsQuery = useQuery({
    queryKey: ["cards"],
    queryFn: Card.getAll,
  });


  const value:CardsViewContextProps = {
    cardsQuery
  }

  return (
    <CardsViewContext value={value}>
      <CardsContent />
    </CardsViewContext>
  )
}

export default Cards