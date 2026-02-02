import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CustomOtpInput from '../inputs/CustomOtpInput';
import VerifyEmailImage from "@/src/assets/img/verify_email.png";
import type { BaseCardProps } from '@/src/classes/Card';
import ErrorIcon from '@mui/icons-material/Error';
import useFetch from '@/src/hooks/useFetch';
import { string } from 'yup';
import Card from '@/src/classes/Card';
import { useQueryClient } from '@tanstack/react-query';
import type { HolderProps } from '@/src/classes/Holder';
import Holder from '@/src/classes/Holder';


type VerifyCardOtpProps = {
  card?: BaseCardProps|null;
  onVerify?: () => void;
}

const validation = string().length(6).required();


const VerifyCardOtp:React.FC<VerifyCardOtpProps> = ({card, onVerify}) => {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const [code, setCode] = useState<string>("");
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const {fetchData:fetchHolder, loading:loadingHolder, error:holderError, response: cardHolder} = useFetch<HolderProps>({autoLoading: true});
  const {fetchData:fetchVerifyOtp, loading:loadingVerify, error:verifyError, response: verifyOtpResponse} = useFetch<BaseCardProps>();
  const {fetchData:fetchResendOtp, loading:loadingResend, error:resendError, response: resendOtpResponse} = useFetch<BaseCardProps>();
  const [timer, setTimer] = useState<number>(() => {
    const diff = new Date(card?.otpExpiresAt!).setMilliseconds(0).valueOf() - new Date().setMilliseconds(0).valueOf();
    if(diff <= 0 || isNaN(diff)) return 0
    return diff;
  });
  const [isExpired, setIsExpired] = useState<boolean>(timer <= 0);
  const [tooManyAttemps, setTooManyAttemps] = useState<boolean>(false);


  const validateForm = useCallback(async(code:string) => {
    try {
      await validation.validate ( 
        code,
        {  strict : true  } , 
      )
      setIsFormValid(true);
    } catch (error) {
      setIsFormValid(false);
    }
  }, [])

  useEffect(() => {
    if(!card) return;
    fetchHolder(Holder.getMeById(card.holderId))
  }, [card?.id])
  

  useEffect(() => {
    let interval:any;
    if(!loadingVerify && card && !verifyError) {
      const diff = new Date(card.otpExpiresAt!).setMilliseconds(0).valueOf() - new Date().setMilliseconds(0).valueOf();
      if(diff <= 0 || isNaN(diff)) {setTimer(0); return;}
      setTimer(diff);
      interval = setInterval(() => {
        setTimer((prev) => {
          if(prev <= 0) {
            clearInterval(interval);
            return prev;
          }else return prev-1000;
        });
      }, 1000)
    }

    return () => {
      clearInterval(interval);
    }
  }, [card?.otpExpiresAt])

  useEffect(() => {
    if(!resendOtpResponse) return;
    queryClient.setQueryData(
      ["cards"],
      (oldData: BaseCardProps[]) => {
        const index = oldData.findIndex((e) => e.id === resendOtpResponse?.id);
        if(index < 0) return oldData;
        return (oldData as any).toSpliced(index, 1, resendOtpResponse);
      }
    );
  }, [resendOtpResponse])
 
  useEffect(() => {
    if(!resendError && verifyOtpResponse) {
      queryClient.setQueryData(
        ["cards"],
        (oldData: BaseCardProps[]) => {
          const index = oldData.findIndex((e) => e.id === verifyOtpResponse?.id);
          if(index < 0) return oldData;
          return (oldData as any).toSpliced(index, 1, verifyOtpResponse);
        }
      );
      onVerify?.();
    } 
  }, [verifyOtpResponse])

  useEffect(() => {
    validateForm(code);
  }, [code])

  useEffect(() => {
    if(timer <= 0) setIsExpired(true);
  }, [timer])
  
  useEffect(() => {
    if((card && card.otpAttempts! >= 5 )|| verifyError?.message === "Too many attempts") 
      setTooManyAttemps(true);
  }, [verifyError, card?.otpAttempts])
  
  const handleClickVerify = useCallback(() => {
    fetchVerifyOtp(Card.verifyOTP({cardId: card!.id, code}));
  }, [code]);

  const handleClickResendCode = useCallback(async () => {
    await fetchResendOtp(Card.resendOTP(card!.id));
    setTooManyAttemps(false);
    setIsExpired(false);
  }, [card]);

  const getTimerFormatted = useCallback((value:number) => {
    if(!value) return "00:00";
    value = value/1000;
    const minutes = Math.floor(value/60);
    const seconds = value%60;
    return `${minutes<10 ?"0" : ""}${minutes}:${seconds<10 ?"0" : ""}${seconds}`
  }, [])

  return !loadingHolder ? (
    <Stack sx={{textAlign: "center"}} spacing={2} p={2}>
      {!tooManyAttemps && !isExpired &&
      <>
        <img style={{width: 300, alignSelf: "center"}} src={VerifyEmailImage} />
        <Typography variant="h4" fontWeight={"bold"}>{t("view.otp_verification.verification.title")}</Typography>
         <Typography>
          <Trans
              i18nKey="view.otp_verification.verification.content_1"
              components={{ bold: <strong/> }}
              values={{ email: cardHolder?.email}}
            />
         </Typography>
        <Typography>{t("view.otp_verification.verification.content_2")}.</Typography>
        <CustomOtpInput isDisabled={loadingVerify} numInputs={6} value={code} onChange={setCode}/>
        <Typography style={{marginTop: 6, marginLeft: "auto"}} variant="caption" color="textSecondary">{t("view.otp_verification.verification.expires")}: <strong>{getTimerFormatted(timer)}</strong></Typography>
        <Button 
          disabled={(loadingVerify || !isFormValid)}
          sx={{width: "fit-content", alignSelf: "center"}}
          variant="contained" size="large"
          onClick={handleClickVerify}
        >
          {t("confirm")}
        </Button>
      </>
      }
      {tooManyAttemps ? 
      <>
      <ErrorIcon color='error' sx={{fontSize: 80, alignSelf: "center"}}/>
      <Typography variant="h4" fontWeight={"bold"}>{t("view.otp_verification.many_attempts.title")}</Typography>
      <Typography>{t("view.otp_verification.many_attempts.content_1")}.</Typography>
      <Typography>{t("view.otp_verification.many_attempts.content_2")}:</Typography>
      <Typography variant='h4'>{getTimerFormatted(timer)}</Typography>
      <Button 
        disabled={(loadingResend || (tooManyAttemps && !isExpired))}
        sx={{width: "fit-content", alignSelf: "center"}}
        variant="contained" size="large"
        onClick={handleClickResendCode}
      >
        {t("resend_code")}
      </Button>
      </>
      : isExpired && 
      <>
      <ErrorIcon color='error' sx={{fontSize: 80, alignSelf: "center"}}/>
      <Typography variant="h4" fontWeight={"bold"}>{t("view.otp_verification.expired.title")}</Typography>
      <Typography>{t("view.otp_verification.expired.content_1")}.</Typography>
      <Button 
        disabled={loadingResend}
        sx={{width: "fit-content", alignSelf: "center"}}
        variant="contained" size="large"
        onClick={handleClickResendCode}
      >
        {t("resend_code")}
      </Button>
      </>
      } 
    </Stack>
  ): (
    <Box sx={{display: "flex", height: 200, alignItems: "center", justifyContent: "center"}}>
      <CircularProgress />
    </Box>
  )

}

export default VerifyCardOtp