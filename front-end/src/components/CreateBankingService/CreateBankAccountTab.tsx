import { Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import CreateBankAccount, { type FormInputsProps } from '@/src/components/Forms/CreateBankAccount';
import { useTranslation } from 'react-i18next';
import { useCreateBankingServiceModal } from './CreateOperaionsModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BankAccount from '@/src/classes/BankAccount';
import { toast } from 'react-toastify';
import { useDashboardView } from '@/src/views/Dashboard';

const CreateBankAccountTab:React.FC = () => {
  const queryClient = useQueryClient();
  const {t} = useTranslation();
  const {setCardToVerifyId} = useDashboardView();
  
  const {setIsPending, closeModal} = useCreateBankingServiceModal();
  const {mutateAsync, isPending} = useMutation({
    mutationFn: (params:any) => BankAccount.create(params),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setCardToVerifyId(data.newCardId);
    }
  });

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending])

  const handleCreateBankAccount = useCallback(async(form: FormInputsProps) => {
    await mutateAsync({holder: form.holder});
    toast.success(t("modal.create.bank_account.success"))
    closeModal?.();
  }, [])



  return (
    <>
      <Typography variant='h5' mb={2} textAlign={"center"}>{t("modal.create.bank_account.title")}</Typography>
      <CreateBankAccount.Root>
        <CreateBankAccount.Form onSendForm={handleCreateBankAccount}>
          <CreateBankAccount.ConfirmButton />
        </CreateBankAccount.Form>
      </CreateBankAccount.Root>
    </>
  )
}

export default CreateBankAccountTab