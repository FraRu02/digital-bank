import React, { useCallback, useMemo, useState } from 'react';
import { type DataGridProps, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonGroup, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';
import type { UserProps } from '@/src/classes/User';
import CustomDataGrid from '@/src/components/CustomDataGrid';
import useConfirmModal from '@/src/hooks/useConfirmModal';
import WarningModal from '@/src/modals/WarningModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@/src/classes/User';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import Holder, { type HolderProps } from '@/src/classes/Holder';
import type { AddressProps } from '@/src/components/inputs/AddressAutocomplete';


type UsersTableProps = {
  holders?: HolderProps[];
  loading?: boolean;
  dataGrid?: Omit<DataGridProps, "rows"|"columns">;
  onRefresh?: () => void;
}



const HoldersTable:React.FC<UsersTableProps> = ({holders, loading=false, dataGrid, onRefresh}) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const {modal:deleteModal, setModal:setDeleteModal} = useConfirmModal();
  const columns = useMemo(():GridColDef<UserProps>[] => [
    { field: "id", headerName: t("id"), width: 170 },
    {
      field: "createdAt",
      headerName: t("creation_date"),
      type: "date",
      width: 200,
      valueFormatter: (value) => new Date(value).toLocaleString()
    },
    { field: "taxCode", headerName: t("tax_code"), width: 170 },
    { field: "name", headerName: t("name"), width: 170 },
    { field: "lastname", headerName: t("lastname"), width: 170 },
    { field: "dateOfBirth", headerName: t("date_of_birth"), width: 170, 
      valueFormatter: (value) => new Date(value).toLocaleDateString()
    },
    { field: "email", headerName: t("Email"), width: 170 },
    { field: "phoneNumber", headerName: t("phone_number"), width: 170 },
    { field: "address", headerName: t("address"), width: 300, 
      valueGetter: (value:AddressProps) => value.properties.formatted
    },
  
  ], [t]) 
  const skeletonRows = useMemo(() => {
    const rows = dataGrid?.initialState?.pagination?.paginationModel?.pageSize;
    return rows ?? 5;
  }, [dataGrid])
  const [editMode, setEditMode] = useState(false);
  const [selectedLength, setSelectedLength] = useState<number>();
  const deleteMutation = useMutation({
    mutationFn: (params:any) => Holder.delete(params),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['holders'] });
      setEditMode(false);
    },
  });


  const handleDelete = useCallback((selectedRows:GridRowSelectionModel) => {
    let ids:string[];
    if(selectedRows.type === "include") {
      ids = Array.from(selectedRows.ids) as string[];
    }else {
      const excludedIds = Array.from(selectedRows.ids) as string[];
      ids = holders!.map((e) => e.id).filter((holderId) => !excludedIds.includes(holderId));
    }
    setSelectedLength(ids.length);
    setDeleteModal({open: true, onConfirm: () => {
      deleteMutation.mutate(ids);
    }});
  }, [holders]);


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
  return holders && (
    <>
    <CustomDataGrid.Root dataGrid={{rows: holders, columns, showToolbar: user?.role === UserRole.admin, ...dataGrid}} activeEditMode={editMode}>
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
      title={t("modal.warning.holder.delete.title", {holder: t('holder', { count: selectedLength })})}
      contentText={t("modal.warning.holder.delete.contentText", {count: selectedLength, holder: t('holder', { count: selectedLength })})}
      warningText={
        <Trans
          i18nKey="modal.warning.holder.delete.warningText"
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

export default HoldersTable