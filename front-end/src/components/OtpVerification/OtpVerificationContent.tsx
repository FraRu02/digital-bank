import { type UserProps } from '@/src/classes/User';
import useFetch from '@/src/hooks/useFetch';
import { resendOtp, verifyOtp } from '@/src/store/auth/authActions';
import type { StoreProps } from '@/src/store/rootReducer';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { string } from 'yup';
import VerifyEmailImage from "@/src/assets/img/verify_email.png";
import CustomOtpInput from '../inputs/CustomOtpInput';
import ErrorIcon from '@mui/icons-material/Error';
import ThemeSwitch from '../ThemeSwitch';
import LanguageSwitch from '../LanguageSwitch';

const validation = string().length(6).required();

const OtpVerificationContent:React.FC = () => {
  const {t} = useTranslation();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const [code, setCode] = useState<string>("");
  const {fetchData:fetchVerifyOtp, loading:loadingVerify, error:verifyError} = useFetch<UserProps>();
  const {fetchData:fetchResendOtp, loading:loadingResend, error:resendError} = useFetch<UserProps>();
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(1000);
  const [isExpired, setIsExpired] = useState<boolean>(false);
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
    let interval:any;
    if(!loadingVerify && user && !verifyError) {
      const diff =  new Date(user.otpExpiresAt!).setMilliseconds(0).valueOf() - new Date().setMilliseconds(0).valueOf();
      if(diff <= 0 || isNaN(diff)) return;
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
  }, [user?.otpExpiresAt])
  
  useEffect(() => {
    validateForm(code);
  }, [code])

  useEffect(() => {
    if(timer <= 0) setIsExpired(true);
  }, [timer])
  
  useEffect(() => {
    if((user && user.otpAttempts! >= 5 )|| verifyError?.message === "Too many attempts") 
      setTooManyAttemps(true);
  }, [verifyError, user?.otpAttempts])
  
  const handleClickVerify = useCallback(() => {
    fetchVerifyOtp(verifyOtp(code));
  }, [code]);

  const handleClickResendCode = useCallback(async () => {
    await fetchResendOtp(resendOtp());
    setTooManyAttemps(false);
    setIsExpired(false);
  }, []);

  const getTimerFormatted = useCallback((value:number) => {
    if(!value) return "00:00";
    value = value/1000;
    const minutes = Math.floor(value/60);
    const seconds = value%60;
    return `${minutes<10 ?"0" : ""}${minutes}:${seconds<10 ?"0" : ""}${seconds}`
  }, [])

  return (
    <>
    <Stack sx={{position: "absolute", top: 0, right: 0, zIndex: 10, p: 1}} direction={"row"}>
      <ThemeSwitch />
      <LanguageSwitch />
    </Stack>
    <Paper 
      sx={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600
      }}
    >
      <Stack sx={{textAlign: "center"}} spacing={2} p={2}>
      {!tooManyAttemps && !isExpired &&
      <>
        <img style={{width: 300, alignSelf: "center"}} src={VerifyEmailImage} />
        <Typography variant="h4" fontWeight={"bold"}>{t("view.otp_verification.verification.title")}</Typography>
         <Typography>
          <Trans
              i18nKey="view.otp_verification.verification.content_1"
              components={{ bold: <strong/> }}
              values={{ email:  user?.email}}
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
    </Paper>
    
    </>
  )

  
  // return (
  //   <Stack sx={{p: 1, width: "100%", maxWidth: 850, mx: "auto"}} spacing={1}>
  //     {!tooManyAttemps && !isExpired &&
  //     <>
  //     <Typography variant="h4" fontWeight={"bold"}>{t("Verification code")}</Typography>
  //     <Typography>{t("We have sent the verification code to your email address")}</Typography>
  //     <TextField value={code} onChange={(e) => setCode(e.target.value)}/>
  //     <Button 
  //       disabled={(loadingVerify || !isFormValid)}
  //       sx={{width: "fit-content", alignSelf: "center"}}
  //       variant="contained" size="large"
  //       onClick={handleClickVerify}
  //     >
  //       {t("confirm")}
  //     </Button>
  //     </>
  //     }
  //     {tooManyAttemps ?
  //     <Stack spacing={1}>
  //       <Typography>{t("Troppi tentativi")}</Typography>
  //       <Typography>{t("Rinvia codice tra")}</Typography>
  //       <Typography>{timer/1000} secondi</Typography>
  //       <Button 
  //         disabled={(loadingResend || (tooManyAttemps && !isExpired))}
  //         sx={{width: "fit-content", alignSelf: "center"}}
  //         variant="contained" size="large"
  //         onClick={handleClickResendCode}
  //       >
  //         {t("Rinvia")}
  //       </Button>
  //     </Stack>
  //     : isExpired ?
  //     <Stack spacing={1}>
  //       <Typography>{t("Codice scaduto")}</Typography>
  //       <Button 
  //         disabled={loadingResend}
  //         sx={{width: "fit-content", alignSelf: "center"}}
  //         variant="contained" size="large"
  //         onClick={handleClickResendCode}
  //       >
  //         {t("Rinvia codice")}
  //       </Button>
  //     </Stack>
  //     :
  //     <Typography>{timer/1000} secondi</Typography>
  //     }
  //   </Stack>
  // )
}

export default OtpVerificationContent