import React, { useCallback, useMemo, useState } from 'react';
import type { BaseTransactionProps } from '@/src/classes/Transaction';
import { type DataGridProps, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonGroup, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';
import CustomDataGrid from './CustomDataGrid';
import useConfirmModal from '@/src/hooks/useConfirmModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Transaction from '@/src/classes/Transaction';
import WarningModal from '@/src/modals/WarningModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import { UserRole } from '@/src/classes/User';

type TransactionsTableProps = {
  transactions?: BaseTransactionProps[];
  cardId?: string;
  loading?: boolean;
  dataGrid?: Omit<DataGridProps, "rows"|"columns">;
  onRefresh?: () => void;
}


const TransactionsTable:React.FC<TransactionsTableProps> = ({transactions, cardId, loading=false, dataGrid, onRefresh}) => {
  const {t, i18n} = useTranslation();
  const queryClient = useQueryClient();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const columns = useMemo(():GridColDef<BaseTransactionProps>[] => {
    const col:GridColDef<BaseTransactionProps>[] = [
      ...(!cardId ? [{ field: "id", headerName: t("id"), width: 170 }] : []),
      {
        field: "createdAt",
        headerName: t("date"),
        type: "date",
        width: 200,
        valueFormatter: (value) => new Date(value).toLocaleString(i18n.language, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      },
      { field: "type", headerName: t("type"), width: 90, valueFormatter: (value) => t(value) },
      {
        field: "import",
        headerName: t("import"),
        type: "number",
        width: 90,
        valueFormatter: (value, transaction) => {
          const label = cardId ? cardId === transaction.sourceCardId ? "- " : "+ " : "";
          return label+t("money_value", {value})
        }
      }
    ];
    if(!cardId) {
      col.push(
        {field: "sourceCardId", headerName: t("source_card"), width: 170 },
        {field: "sourceBankAccountId", headerName: t("source_bank_account"), width: 170 },
        {field: "destinationCardId", headerName: t("destination_card"), width: 170 },
        {field: "destinationBankAccountId", headerName: t("destination_bank_account"), width: 170 }
      )
    }else {
      col.push(
        { 
          field: "sender", headerName: t("sender"), width: 170,
          valueGetter: (value, row) => `${row.sender?.name || ''} ${row.sender?.lastname || ''}`,
        },
        { 
          field: "beneficiary", headerName: t("recipient"), width: 170,
          valueGetter: (value, row) => `${row.beneficiary?.name || ''} ${row.beneficiary?.lastname || ''}`,
        },
      )
    }
    return col;

  }, [t, cardId]) 
  const skeletonRows = useMemo(() => {
    const rows = dataGrid?.initialState?.pagination?.paginationModel?.pageSize;
    return rows ?? 5;
  }, [dataGrid])

  const {modal:deleteModal, setModal:setDeleteModal} = useConfirmModal();
  const [editMode, setEditMode] = useState(false);
  const [selectedLength, setSelectedLength] = useState<number>();
  const deleteMutation = useMutation({
    mutationFn: (params:any) => Transaction.delete(params),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setEditMode(false);
    },
  });


  const handleDelete = useCallback((selectedRows:GridRowSelectionModel) => {
    let ids:string[];
    if(selectedRows.type === "include") {
      ids = Array.from(selectedRows.ids) as string[];
    }else {
      const excludedIds = Array.from(selectedRows.ids) as string[];
      ids = transactions!.map((e) => e.id).filter((transactionId) => !excludedIds.includes(transactionId));
    }
    setSelectedLength(ids.length);
    setDeleteModal({open: true, onConfirm: () => {
      deleteMutation.mutate(ids);
    }});
  }, [transactions]);

  const handleCloseModal = useCallback(() => {
    deleteMutation.reset();
    deleteModal.onClose?.();
  }, [deleteModal])

  if(loading) return (
    <Stack spacing={1}>
      {new Array(skeletonRows).fill(0).map((e, index) => (
        <Skeleton key={index} variant="rounded" height={50}/>
      ))}
    </Stack>
  )

  return transactions && (
    <>
    <CustomDataGrid.Root dataGrid={{rows: transactions, columns, showToolbar: user?.role === UserRole.admin, ...dataGrid}} activeEditMode={editMode}>
      <CustomDataGrid.Table toolbar={
        <Stack sx={{p: 1}} spacing={1} alignItems={"center"} direction={"row"}>
          <CustomDataGrid.SearchBar />
          <ButtonGroup style={{marginLeft: "auto", height: "fit-content",}}>
            <CustomDataGrid.DeleteButton onClick={(e, selected) => handleDelete(selected)}/>
            <CustomDataGrid.EditButton onClick={() => { setEditMode(prev => !prev)}}/>
            <CustomDataGrid.RefreshButton onClick={onRefresh}/>
          </ButtonGroup>
        </Stack>
      }/>
    </CustomDataGrid.Root>
    <WarningModal 
      title={t("modal.warning.transaction.delete.title", {transaction: t('transaction', { count: selectedLength })})}
      contentText={t("modal.warning.transaction.delete.contentText", {count: selectedLength, transaction: t('transaction', { count: selectedLength })})}
      warningText={
        <Trans
          i18nKey="modal.warning.transaction.delete.warningText"
          count={selectedLength}
        />
      }
      content={
        deleteMutation.isPending ? 
          <Stack spacing={2} alignItems={"center"}>
            <Typography>{t("deleting.progress")}</Typography>
            <CircularProgress />
          </Stack>
        : deleteMutation.isSuccess ? 
        <Stack spacing={1} direction={"row"}>
          <CheckCircleIcon color="success"/>
          <Typography>{t("deleting.successfully")}</Typography>
        </Stack>
        : deleteMutation.isError && 
        <Stack spacing={1} direction={"row"}>
          <ErrorIcon color="error"/>
          <Typography>{t("something_wrong")}</Typography>
        </Stack>
      }
      onCancel={deleteModal.onCancel}
      onConfirm={deleteModal.onConfirm}
      modalOptions={{
        open: deleteModal.open,
        onClose: handleCloseModal
      }}  
    />
    </>
  )
}

export default TransactionsTable