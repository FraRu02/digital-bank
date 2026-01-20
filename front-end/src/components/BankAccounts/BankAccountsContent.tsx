import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBankAccountsView } from '@/src/views/BankAccounts';
import BankAccountsTable from './BankAccountsTable';

const BankAccountsContent:React.FC = () => {
  const {t} = useTranslation();
  const {bankAccountsQuery} = useBankAccountsView();
  const {data, isFetching, refetch} = bankAccountsQuery;
  
  return (
    <Box sx={{p: 1}}>
      <Typography sx={{mb: 2}} fontWeight={"bold"} variant='h5'>{t("bank_account_other")}</Typography>
      <BankAccountsTable
        loading={isFetching}
        bankAccounts={data} 
        onRefresh={refetch}
        dataGrid={{
          initialState: {
            pagination: {
              paginationModel: {
                pageSize: 10
              }
            }
          }
        }}
      />
    </Box>
  )
}

export default BankAccountsContent