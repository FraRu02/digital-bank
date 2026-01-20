import React, { useCallback, useMemo, useState } from 'react';
import { type DataGridProps, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonGroup, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';
import type { BankAccountProps } from '@/src/classes/BankAccount';
import WarningModal from '@/src/modals/WarningModal';
import CustomDataGrid from '../CustomDataGrid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BankAccount from '@/src/classes/BankAccount';
import useConfirmModal from '@/src/hooks/useConfirmModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import { UserRole } from '@/src/classes/User';

type BankAccountsTableProps = {
  bankAccounts?: BankAccountProps[];
  loading?: boolean;
  dataGrid?: Omit<DataGridProps, "rows"|"columns">;
  onRefresh?: () => void;
}


const BankAccountsTable:React.FC<BankAccountsTableProps> = ({bankAccounts, loading=false, dataGrid, onRefresh}) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const columns = useMemo(():GridColDef<BankAccountProps>[] => {
    return [
      { field: "id", headerName: t("id"), width: 170 },
      {
        field: "createdAt",
        headerName: t("creation_date"),
        type: "date",
        width: 200,
        valueFormatter: (value) => new Date(value).toLocaleString()
      },
      { field: "userId", headerName: t("user_one"), width: 170 },
      { field: "holderId", headerName: t("holder_one"), width: 170 },
      { field: "iban", headerName: t("IBAN"), width: 250 },
      {
        field: "balance",
        headerName: t("balance"),
        type: "number",
        width: 90,
        valueFormatter: (value) => {
          return t("money_value", {value})
        }
      }
    ];

  }, [t]) 
  const {modal:deleteModal, setModal:setDeleteModal} = useConfirmModal();
  const [editMode, setEditMode] = useState(false);
  const [selectedLength, setSelectedLength] = useState<number>();
  const deleteMutation = useMutation({
    mutationFn: (params:any) => BankAccount.delete(params),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      setEditMode(false);
    },
  });

  const skeletonRows = useMemo(() => {
    const rows = dataGrid?.initialState?.pagination?.paginationModel?.pageSize;
    return rows ?? 5;
  }, [dataGrid])


  const handleDelete = useCallback((selectedRows:GridRowSelectionModel) => {
    let ids:string[];
    if(selectedRows.type === "include") {
      ids = Array.from(selectedRows.ids) as string[];
    }else {
      const excludedIds = Array.from(selectedRows.ids) as string[];
      ids = bankAccounts!.map((e) => e.id).filter((bankAccountId) => !excludedIds.includes(bankAccountId));
    }
    setSelectedLength(ids.length);
    setDeleteModal({open: true, onConfirm: () => {
      deleteMutation.mutate(ids);
    }});
  }, [bankAccounts]);

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
  
  return bankAccounts && (
    <>
    <CustomDataGrid.Root dataGrid={{rows: bankAccounts, columns, showToolbar: user?.role === UserRole.admin, ...dataGrid}} activeEditMode={editMode}>
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
      title={t("modal.warning.bank_account.delete.title", {bank_account: t('bank_account', { count: selectedLength })})}
      contentText={t("modal.warning.bank_account.delete.contentText", {count: selectedLength, bank_account: t('bank_account', { count: selectedLength })})}
      warningText={
        <Trans
          i18nKey="modal.warning.bank_account.delete.warningText"
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

export default BankAccountsTable