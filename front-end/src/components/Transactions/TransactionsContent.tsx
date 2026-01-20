import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TransactionsTable from '@/src/components/TransactionsTable';
import { useTransactionsView } from '@/src/views/Transactions';

const TransactionsContent = () => {
  const {t} = useTranslation();
  const {transactionsQuery} = useTransactionsView();
  const {data, isFetching, refetch} = transactionsQuery;
  
  return (
    <Box sx={{p: 1}}>
      <Typography sx={{mb: 2}} fontWeight={"bold"} variant='h5'>{t("transaction_other")}</Typography>
      <TransactionsTable 
        loading={isFetching} 
        transactions={data} 
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

export default TransactionsContent