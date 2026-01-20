import React, { useCallback, useMemo, useState } from 'react';
import { type DataGridProps, type GridColDef, type GridRowSelectionModel } from '@mui/x-data-grid';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonGroup, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';
import type { UserProps } from '@/src/classes/User';
import CustomDataGrid from './CustomDataGrid';
import useConfirmModal from '@/src/hooks/useConfirmModal';
import WarningModal from '../modals/WarningModal';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import User, { UserRole, UserStatus } from '@/src/classes/User';
import Utilities from '@/src/classes/Utilities';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';


type UsersTableProps = {
  users?: UserProps[];
  loading?: boolean;
  dataGrid?: Omit<DataGridProps, "rows"|"columns">;
  onRefresh?: () => void;
}



const UsersTable:React.FC<UsersTableProps> = ({users, loading=false, dataGrid, onRefresh}) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const {modal:deleteModal, setModal:setDeleteModal} = useConfirmModal();
  const {modal:saveModal, setModal: setSaveModal} = useConfirmModal();
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
    { field: "name", headerName: t("name"), width: 170, editable: true, },
    { field: "lastname", headerName: t("lastname"), width: 170, editable: true, },
    { field: "role", headerName: t("role"), width: 130, editable: true,
      type: 'singleSelect',
      valueOptions: [
        { value: UserRole.admin, label: t("admin") },
        { value: UserRole.member, label: t("member") },
      ],
    },
    { field: "status", headerName: t("status"), width: 170, editable: true,
      type: "singleSelect",
      valueOptions: [
        { value: UserStatus.active, label: t("active") },
        { value: UserStatus.pending_verification, label: t("pending_verification") },
      ],
      valueFormatter: (value) => t(value)
    },

  ], [t]) 
  const skeletonRows = useMemo(() => {
    const rows = dataGrid?.initialState?.pagination?.paginationModel?.pageSize;
    return rows ?? 5;
  }, [dataGrid])
  const [editMode, setEditMode] = useState(false);
  const [selectedLength, setSelectedLength] = useState<number>();
  const mutationEdit = useMutation({
    mutationFn: (params:any) => User.update(params),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditMode(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (params:any) => User.delete(params),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditMode(false);
    },
  });


  const handleDelete = useCallback((selectedRows:GridRowSelectionModel) => {
    let ids:string[];
    if(selectedRows.type === "include") {
      ids = Array.from(selectedRows.ids) as string[];
    }else {
      const excludedIds = Array.from(selectedRows.ids) as string[];
      ids = users!.map((e) => e.id).filter((userId) => !excludedIds.includes(userId));
    }
    setSelectedLength(ids.length);
    setDeleteModal({open: true, onConfirm: () => {
      deleteMutation.mutate(ids);
    }});
  }, [users]);

  const handleSave = useCallback((editedRows:Record<string, any>) => {
    setSelectedLength(Object.keys(editedRows).length);
    setSaveModal({open: true, onConfirm: async() => {
      const updatedUsers = Object.keys(editedRows).map((id) => ({id, data: editedRows[id]}));
      console.log(updatedUsers);
      mutationEdit.mutate(updatedUsers);
    }})
  }, []);

  const handleCloseModal = useCallback(() => {
    deleteMutation.reset();
    deleteModal.onClose?.();
  }, [deleteModal])

  const handleCloseSaveModal = useCallback(() => {
    mutationEdit.reset();
    saveModal.onClose?.();
  }, [saveModal])


  if(loading) return (
    <Stack spacing={1}>
      {new Array(skeletonRows).fill(0).map((e, index) => (
        <Skeleton key={index} variant="rounded" height={50}/>
      ))}
    </Stack>
  )
  return users && (
    <>
    <CustomDataGrid.Root dataGrid={{rows: users, columns, showToolbar: user?.role === UserRole.admin, ...dataGrid}} activeEditMode={editMode}>
      <CustomDataGrid.Table toolbar={
        <Stack sx={{p: 1}} spacing={1} alignItems={"center"} direction={"row"}>
          <CustomDataGrid.SearchBar />
          <ButtonGroup style={{marginLeft: "auto", height: "fit-content",}}>
            <CustomDataGrid.SaveButton onClick={handleSave}/>
            <CustomDataGrid.DeleteButton onClick={(e, selected) => handleDelete(selected)}/>
            <CustomDataGrid.EditButton onClick={() => { setEditMode(prev => !prev)}}/>
            <CustomDataGrid.RefreshButton onClick={onRefresh}/>
          </ButtonGroup>
        </Stack>
      }/>
    </CustomDataGrid.Root>
    <WarningModal 
      title={t("modal.warning.user.delete.title", {user: t('user', { count: selectedLength })})}
      contentText={t("modal.warning.user.delete.contentText", {count: selectedLength, user: t('user', { count: selectedLength })})}
      warningText={
        <Trans
          i18nKey="modal.warning.user.delete.warningText"
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
    <WarningModal 
      title={t("modal.warning.user.save.title", {user: t("user", {count: selectedLength})})}
      contentText={t("modal.warning.user.save.contentText", {count: selectedLength, user: t("user", {count: selectedLength})})}
      content={
        mutationEdit.isPending ? 
          <Stack spacing={2} alignItems={"center"}>
            <Typography>{t("saving.progress")}</Typography>
            <CircularProgress />
          </Stack>
        : mutationEdit.isSuccess ? 
        <Stack spacing={1} direction={"row"}>
          <CheckCircleIcon color="success"/>
          <Typography>{t("saving.successfully")}</Typography>
        </Stack>
        : mutationEdit.isError && 
        <Stack spacing={1} direction={"row"}>
          <ErrorIcon color="error"/>
          <Typography>{t("something_wrong")}</Typography>
        </Stack>
      }
      onCancel={saveModal.onCancel}
      onConfirm={saveModal.onConfirm}
      modalOptions={{
        open: saveModal.open,
        onClose: handleCloseSaveModal
      }}  
    />
    </>

  )
}

export default UsersTable