import { Typography } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import CreateCard, { type FormInputsProps } from '@/src/components/Forms/CreateCard';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useCreateBankingServiceModal } from './CreateOperaionsModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Card from '@/src/classes/Card';

const CreateCardTab:React.FC = () => {
  const queryClient = useQueryClient();
  const {t} = useTranslation();
  const {setIsPending, closeModal} = useCreateBankingServiceModal();

  const {mutateAsync, isPending} = useMutation({
    mutationFn: (params:any) => Card.create(params),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  });

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending])

  const handleCreateCard = useCallback(async(form: FormInputsProps) => {
    const obj = {type: form.cardType, bankAccountId: form.bankAccountId??undefined, holder: form.holder};
    await mutateAsync(obj);
    toast.success(t("modal.create.card.success"))
    closeModal?.();
  }, [])

  return (
    <>
      <Typography variant='h5' mb={2} textAlign={"center"}>{t("modal.create.card.title")}</Typography>
      <CreateCard.Root>
        <CreateCard.Form onSendForm={handleCreateCard}>
          <CreateCard.ConfirmButton />
        </CreateCard.Form>
      </CreateCard.Root>
    </>
  )
}

export default CreateCardTab