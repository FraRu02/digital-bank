import React, { useCallback, useMemo, useState } from 'react';
import { type DataGridProps, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonGroup, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';
import type { BaseCardProps } from '@/src/classes/Card';
import CustomDataGrid from '@/src/components/CustomDataGrid';
import WarningModal from '@/src/modals/WarningModal';
import useConfirmModal from '@/src/hooks/useConfirmModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '@/src/classes/Card';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import { UserRole } from '@/src/classes/User';


type CardsTableProps = {
  cards?: BaseCardProps[];
  loading?: boolean;
  dataGrid?: Omit<DataGridProps, "rows"|"columns">;
  onRefresh?: () => void;
}


const CardsTable:React.FC<CardsTableProps> = ({cards, loading=false, dataGrid, onRefresh}) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const columns = useMemo(():GridColDef<BaseCardProps>[] => {
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
      { field: "holderId", headerName: t("holder_one"), width: 170 ,
        valueFormatter: (value, row) => value ?? row.userId
      },
      { field: "number", headerName: t("number"), width: 170 },
      { field: "type", headerName: t("type"), width: 90, valueFormatter: (value) => t(value) },
      { field: "bankAccountId", headerName: t("bank_account_one"), width: 170 },
      {
        field: "balance",
        headerName: t("balance"),
        type: "number",
        width: 90,
        valueFormatter: (value) => {
          return value ? t("money_value", {value}) : ""
        }
      }
    ];

  }, [t]) 

  const {modal:deleteModal, setModal:setDeleteModal} = useConfirmModal();
  const [editMode, setEditMode] = useState(false);
  const [selectedLength, setSelectedLength] = useState<number>();
  const deleteMutation = useMutation({
    mutationFn: (params:any) => Card.delete(params),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setEditMode(false);
    },
  });

  const skeletonRows = useMemo(() => {
    const rows = dataGrid?.initialState?.pagination?.paginationModel?.pageSize;
    return rows ?? 5;
  }, [dataGrid]);


  const handleDelete = useCallback((selectedRows:GridRowSelectionModel) => {
    let ids:string[];
    if(selectedRows.type === "include") {
      ids = Array.from(selectedRows.ids) as string[];
    }else {
      const excludedIds = Array.from(selectedRows.ids) as string[];
      ids = cards!.map((e) => e.id).filter((cardId) => !excludedIds.includes(cardId));
    }
    setSelectedLength(ids.length);
    setDeleteModal({open: true, onConfirm: () => {
      deleteMutation.mutate(ids);
    }});
  }, [cards]);

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


  
  return cards && (
    <>
    <CustomDataGrid.Root dataGrid={{rows: cards, columns, showToolbar: user?.role === UserRole.admin, ...dataGrid}} activeEditMode={editMode}>
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
      title={t("modal.warning.card.delete.title", {card: t('card', { count: selectedLength })})}
      contentText={t("modal.warning.card.delete.contentText", {count: selectedLength, card: t('card', { count: selectedLength })})}
      warningText={
        <Trans
          i18nKey="modal.warning.card.delete.warningText"
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

export default CardsTable