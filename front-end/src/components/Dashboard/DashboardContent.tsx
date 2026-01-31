import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import BankingInfoCard from '@/src/components/BankingInfoCard';
import CardsList from '@/src/components/Dashboard/CardsList';
import { useDashboardView } from '@/src/views/Dashboard';
import TransactionsChip from './TransactionsChip';
import OperationsModal from './OperationsTabs/OperationsModal';
import AlertsChip from './AlertsChip';
import Loading from '@/src/components/Loading';
import image from "@/src/assets/img/new_bank_account.png";
import CreateBankingServiceModal from '@/src/components/CreateBankingService/CreateOperaionsModal';
import { UserRole } from '@/src/classes/User';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import VerifyCardOtpModal from './VerifyCardOtpModal';
import { CardStatus, type BaseCardProps } from '@/src/classes/Card';


const DashboardContent = () => {
  const {t} = useTranslation();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const {bankAccountQuery, selectedCardQuery, cardsQuery, incExpQuery, selectedCard, cardToVerify, setCardToVerify, setSelectedCard} = useDashboardView();
  const {data:cards, isLoading:loadingCards, isFetching:fetchingCards} = cardsQuery;
  const {data:bankAccount, isFetching:fetchingBankAccount} = bankAccountQuery;
  const {data:selectedCardData, isFetching:fetchingSelectedCard} = selectedCardQuery;
  const {data:incExp, isFetching:fetchingIncExp} = incExpQuery;
  const [openOperationsModal, setOpenOperationsModal] = useState<boolean>(false);
  const [openServiceModal, setOpenServiceModal] = useState<boolean>(false);
  const [openVerifyCardOtpModal, setOpenVerifyCardOtpModal] = useState<boolean>(false);
  const stackRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState<number>();

  useEffect(() => {
    if(!stackRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setGridHeight(entries[0].contentRect.height);     
    });
    observer.observe(stackRef.current);
    return () => {
      if(stackRef.current) observer.unobserve(stackRef.current);
      observer.disconnect();
    }
  }, [stackRef.current])

  useEffect(() => {
    if(cards && cards.length > 0) {
      const cardId = localStorage.getItem("selectedCard");
      const localStorageCard = cardId ? cards.find(e => e.id === cardId): null;
      if(localStorageCard) setSelectedCard(localStorageCard);
      else {
        const firstAvailableCard = cards.find((e) => e.status === CardStatus.active);
        if(firstAvailableCard) handleSelectCard(firstAvailableCard);
      }
    }
  }, [cards]);

  useEffect(() => {
    if(!loadingCards && cards && cards.length > 0) {
      const firstPendingCard = cards.find((e) => e.status === CardStatus.pending_verification) ?? null;
      setCardToVerify(firstPendingCard);
    }
  }, [loadingCards])


  useEffect(() => {
    setOpenVerifyCardOtpModal(Boolean(cardToVerify));
  }, [cardToVerify])


  const handleSelectCard = useCallback((card:BaseCardProps) => {
    setSelectedCard(card);
    localStorage.setItem("selectedCard", card.id);
  }, [])

  if(loadingCards) {
    return (
      <Loading fullScreen/>
    )
  }

  if(cards && cards.length <= 0) {
    return (
      <Box sx={{width: "100%", height: "100%", p: 1}}>
        <Box sx={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center"}}>
          <Stack sx={{ width: "100%", maxWidth:700, p: 2}} >
            <Typography sx={{fontWeight: "bold", textAlign: "center"}} variant='h4'>Crea il tuo primo conto!</Typography>
            <img style={{width: "100%"}} src={image} />
            <Button size="large" variant="contained" color="primary" onClick={() => setOpenServiceModal(true)}>Crea adesso</Button>
          </Stack>
        </Box>
      <CreateBankingServiceModal open={openServiceModal} onClose={() => setOpenServiceModal(false)}/>
      </Box>
    )
  }


  return cards && (
    <Box sx={{position: "relative", width: "100%", height: "100%", p: 1}}>
      <Stack direction={"row"} spacing={1}>
        <Typography fontWeight={"bold"} variant='h5'>Dashboard</Typography>
        {user?.role === UserRole.member && <Button style={{marginLeft: "auto"}} variant="contained" onClick={() => setOpenServiceModal(true)}>{t("new")} +</Button>}
      </Stack>
      <Grid container spacing={2}>
        <Grid size={12}>
          <CardsList
            list={cards}
            selected={selectedCard}
            loadingCardId={(fetchingSelectedCard||fetchingBankAccount||fetchingIncExp) ? selectedCard?.id : null}
            onClickItem={handleSelectCard}
            onClickItemVerify={(card) => setCardToVerify(card)}
          />
        </Grid>
       {cards.length > 0 && 
       <>
        <Grid height={gridHeight} size={{xs: 12, md: 6}}>
          <AlertsChip />
        </Grid>
        <Grid size={{xs: 12, md: 6}}>
          <Stack ref={stackRef} spacing={2}>
            <BankingInfoCard
              loading={fetchingBankAccount || fetchingIncExp || fetchingSelectedCard}
              card={selectedCardData}
              bankAccount={bankAccount ?? undefined}
              incExp={incExp}
              onClickTransferMoney={() => setOpenOperationsModal(true)}
            />
            <TransactionsChip />
          </Stack>
        </Grid>
       </>
        }
      </Grid>
      <OperationsModal open={openOperationsModal} onClose={() => setOpenOperationsModal(false)}/>
      <CreateBankingServiceModal open={openServiceModal} onClose={() => setOpenServiceModal(false)}/>
      <VerifyCardOtpModal open={openVerifyCardOtpModal} onClose={() => setOpenVerifyCardOtpModal(false)}/>
    </Box>
  )
}

export default DashboardContent