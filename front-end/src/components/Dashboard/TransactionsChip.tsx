import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardView } from '@/src/views/Dashboard';
import TransactionsTable from '../TransactionsTable';
import { Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const TransactionsChip = () => {
  const {t} = useTranslation();
  const {selectedCard, transactionsQuery} = useDashboardView();
  const {data, isFetching} = transactionsQuery;
  return (
    <Paper sx={{p: 2}}>
      <Typography variant="h5" mb={1}>{t("latest_transactions")}</Typography>
      <TransactionsTable transactions={data} cardId={selectedCard?.id} loading={isFetching}/>  
    </Paper>
  )
}

export default TransactionsChip