import React, { useCallback } from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import type { BankAccountProps } from '@/src/classes/BankAccount';
import { useTranslation } from 'react-i18next';
import type { BaseCardProps } from '@/src/classes/Card';
import Card from '@/src/classes/Card';

type BankingInfoCardProps = {
  loading?: boolean;
  card?: BaseCardProps;
  incExp?: {inc: number, exp: number};
  bankAccount?: BankAccountProps;
  onClickTransferMoney: () => void;
}


const BankingInfoCard:React.FC<BankingInfoCardProps> = ({card, incExp, bankAccount, loading=false, onClickTransferMoney}) => {
  const {t} = useTranslation();

  const getSkeleton = useCallback(() => {

    return (
     <Paper sx={{p: "1rem"}}>
      <Stack spacing={3}>
        <Skeleton  />
        <Skeleton variant="rectangular" height={53}/>
        <Stack direction={"row"} spacing={12}>
          <Skeleton width={"60%"} height={43} variant='rectangular'/>
          <Skeleton width={"40%"} height={43} variant="rounded" />
        </Stack>
      </Stack>
    </Paper>
    )
  }, [])

  if(loading) return getSkeleton();

  if(card && incExp) {
    if(bankAccount) {
      return (
        <Paper sx={{p: "1rem"}}>
          <Stack spacing={3}>
            <Stack sx={{width: "100%"}} direction="row" spacing={1}>
              <Typography variant="caption">{t("bank_account_one")}</Typography>
              <Typography style={{marginLeft: "auto"}} variant="caption">{t("available_funds")}</Typography>
            </Stack>
            <Box>
              <Typography fontWeight={"bold"}>IBAN</Typography>
              <Stack spacing={1} direction={"row"}>
                <Typography>{bankAccount.iban}</Typography>
                <Typography style={{marginLeft: "auto"}} variant="h5" fontWeight={"bold"}>{t("money_value", {value: bankAccount.balance})}</Typography>
              </Stack>
            </Box>
            <Stack direction={"row"} spacing={4}>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <Paper sx={{display: "flex", background: "green", padding: "0.2rem", boxShadow: "none"}}>
                  <ArrowDownwardIcon />
                </Paper>
                <Stack>
                  <Typography fontWeight={"bold"}>{t("money_value", {value: incExp.inc})}</Typography>
                  <Typography variant="caption">{t("income")}</Typography>
                </Stack>
              </Stack>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <Paper sx={{display: "flex", background: "red", padding: "0.2rem", boxShadow: "none"}}>
                  <ArrowUpwardIcon />
                </Paper>
                <Stack>
                  <Typography fontWeight={"bold"}>{t("money_value", {value: incExp.exp})}</Typography>
                  <Typography variant="caption">{t("expense")}</Typography>
                </Stack>
              </Stack>
              <Button style={{marginLeft: "auto"}} size="medium" variant="contained" onClick={onClickTransferMoney}>{t("transfer_money")}</Button>
            </Stack>
          </Stack>
        </Paper>
      )
    }else if(Card.isPrepaidType(card)){
      return (
        <Paper sx={{p: "1rem"}}>
          <Stack spacing={3}>
            <Stack sx={{width: "100%"}} direction="row" spacing={1}>
              <Typography variant="caption">{t("prepaid_card")}</Typography>
              <Typography style={{marginLeft: "auto"}} variant="caption">{t("available_funds")}</Typography>
            </Stack>
            <Box>
              <Typography fontWeight={"bold"}>{t("number")}</Typography>
              <Stack spacing={1} direction={"row"}>
                <Typography>{card.number}</Typography>
                <Typography style={{marginLeft: "auto"}} variant="h5" fontWeight={"bold"}>{t("money_value", {value: card.balance})}</Typography>
              </Stack>
            </Box>
            <Stack direction={"row"} spacing={4}>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <Paper sx={{display: "flex", background: "green", padding: "0.2rem", boxShadow: "none"}}>
                  <ArrowDownwardIcon />
                </Paper>
                <Stack>
                  <Typography fontWeight={"bold"}>{t("money_value", {value: incExp.inc})}</Typography>
                  <Typography variant="caption">{t("income")}</Typography>
                </Stack>
              </Stack>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                <Paper sx={{display: "flex", background: "red", padding: "0.2rem", boxShadow: "none"}}>
                  <ArrowUpwardIcon />
                </Paper>
                <Stack>
                  <Typography fontWeight={"bold"}>{t("money_value", {value: incExp.exp})}</Typography>
                  <Typography variant="caption">{t("expense")}</Typography>
                </Stack>
              </Stack>
              <Button style={{marginLeft: "auto"}} size="medium" variant="contained" onClick={onClickTransferMoney}>{t("transfer_money")}</Button>
            </Stack>
          </Stack>
        </Paper>
      )
    }
  }
}

export default BankingInfoCard