import React, { useCallback, useEffect } from 'react';
import { Typography } from '@mui/material';
import TransferMoney, { type FormInputsProps } from '@/src/components/Forms/TransferMoney';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboardView } from '@/src/views/Dashboard';
import Transaction from '@/src/classes/Transaction';
import { toast } from 'react-toastify';
import { useOperationsModal } from './OperationsModal';
import Card, { type BaseCardProps, type PrepaidCardProps } from '@/src/classes/Card';



const TransferMoneyTab:React.FC = () => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {selectedCard} = useDashboardView();
  const {closeModal, setIsPending} = useOperationsModal();
  const {mutateAsync, isPending} = useMutation({
    mutationFn: (params:any) => Transaction.create(params),
    onSuccess: (newTransaction) => {
      // Invalidate and refetch
      if(Card.isPrepaidType(selectedCard)) queryClient.invalidateQueries({ queryKey: ["cards", selectedCard.id] });
      queryClient.invalidateQueries({ queryKey: ["bankAccount"] });
      queryClient.invalidateQueries({ queryKey: ["incExp"] });
      queryClient.setQueryData(
        ["transactions", selectedCard?.id],
        (oldData: any) => {
          if (!oldData) return newTransaction;
          return [newTransaction[0], ...oldData];
        }
      );
      toast.success(t("modal.create.transaction.success"));
      closeModal?.();
    },
  });

  useEffect(() => {
    setIsPending(isPending);
  }, [isPending])

  const handleTransferMoney = useCallback(async(form: FormInputsProps) => {
    if(form.type === "bankAccount") {
      await mutateAsync({
        sourceCardNumber: selectedCard!.number, 
        destinationIban: form.iban, 
        import: form.import,
        description: form.description
      });
    }else {
      await mutateAsync({
        sourceCardNumber: selectedCard!.number,
        destinationCardNumber: form.cardNumber,
        import: form.import,
        description: form.description
      });
    }
  }, [selectedCard])


  return (
    <>
      <Typography variant='h5' mb={2} textAlign={"center"}>{t("transfer_money")}</Typography>
      <TransferMoney.Root>
        <TransferMoney.Form onSendForm={handleTransferMoney}>
          <TransferMoney.ConfirmButton />
        </TransferMoney.Form>
      </TransferMoney.Root>
    </>
  )
}

export default TransferMoneyTab