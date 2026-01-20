import React, { createContext, useContext } from 'react';
import UsersContent from '@/src/components/Users/UsersContent';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import User, { type UserProps } from '@/src/classes/User';

type UsersViewContextProps = {
  usersQuery: UseQueryResult<UserProps[], Error>
}
const UsersViewContext = createContext<UsersViewContextProps|undefined>(undefined);
export const useUsersView = () => useContext(UsersViewContext)!

const Users = () => {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: User.get,
  });


  const value:UsersViewContextProps = {
    usersQuery
  }

  return (
    <UsersViewContext value={value}>
      <UsersContent />
    </UsersViewContext>
  )
}

export default Users