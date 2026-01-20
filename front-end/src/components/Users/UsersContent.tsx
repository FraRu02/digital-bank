import { Box, Typography } from '@mui/material';
import UsersTable from '@/src/components/UsersTable';
import { useUsersView } from '@/src/views/Users';
import { useTranslation } from 'react-i18next';

const UsersContent = () => {
  const {t} = useTranslation();
  const {usersQuery} = useUsersView();
  const {data, isFetching, refetch} = usersQuery;
  
  return (
    <Box sx={{p: 1}}>
      <Typography sx={{mb: 2}} fontWeight={"bold"} variant='h5'>{t("user_other")}</Typography>
      <UsersTable
        users={data}
        loading={isFetching}
        onRefresh={refetch}
        dataGrid={{
          initialState:{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }
        }}
      />
    </Box>
  )
}

export default UsersContent