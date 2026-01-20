import { createContext, useContext } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import HoldersContent from '@/src/components/Holders/HoldersContent';
import Holder, { type HolderProps } from '@/src/classes/Holder';

type HoldersViewContextProps = {
  usersQuery: UseQueryResult<HolderProps[], Error>
}
const HoldersViewContext = createContext<HoldersViewContextProps|undefined>(undefined);
export const useHoldersView = () => useContext(HoldersViewContext)!

const Holders = () => {
  const usersQuery = useQuery({
    queryKey: ["holders"],
    queryFn: Holder.getAll,
  });


  const value:HoldersViewContextProps = {
    usersQuery
  }

  return (
    <HoldersViewContext value={value}>
      <HoldersContent />
    </HoldersViewContext>
  )
}

export default Holders