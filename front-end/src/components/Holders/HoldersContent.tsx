import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import HoldersTable from '@/src/components/Holders/HoldersTable';
import { useHoldersView } from '@/src/views/Holders';

const HoldersContent = () => {
  const {t} = useTranslation();
  const {usersQuery} = useHoldersView();
  const {data, isFetching, refetch} = usersQuery;
  
  return (
    <Box sx={{p: 1}}>
      <Typography sx={{mb: 2}} fontWeight={"bold"} variant='h5'>{t("holder_other")}</Typography>
      <HoldersTable
        holders={data}
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

export default HoldersContent