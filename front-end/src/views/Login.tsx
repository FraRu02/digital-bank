import React, { useCallback, useState } from 'react'
import { useSelector } from 'react-redux';
import type { StoreProps } from '../store/rootReducer';
import { Link, Navigate } from 'react-router-dom';
import { RoutePath } from '../routesConfig';
import { Box, Button, CircularProgress, Paper, Link as MuiLink, Stack, TextField, Typography, FormHelperText } from '@mui/material';
import { login } from '@/src/store/auth/authActions';
import useForm from '@/src/hooks/useForm';
import PasswordField from '@/src/components/inputs/PasswordField';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from '@/src/components/LanguageSwitch';
import ThemeSwitch from '@/src/components/ThemeSwitch';


const initialForm = {
  email: "",
  password: ""
}

const Login = () => {
  const {loading, isAuthenticated} = useSelector((state:StoreProps) => state.auth);
  const {t} = useTranslation();
  const {form, setForm, loading:loadingForm, error, onSend} = useForm(initialForm);
  const {email, password} = form;
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback(async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = await onSend(login(email, password));
    if(!data.error) setForm({newState: initialForm});
  }, [form]);

  if(!loading && isAuthenticated) return <Navigate to={RoutePath['/']}/> 

  return (
    <Box sx={{width: "100vw", height: "100vh"}}>
      <Stack sx={{position: "absolute", top: 0, right: 0, zIndex: 10, p: 1}} direction={"row"}>
        <ThemeSwitch />
        <LanguageSwitch />
      </Stack>
      <Stack sx={{width: "100%", height: "100%", gap: "1rem"}}>
        <Typography sx={{position: "fixed", pt: 10, zIndex: 5, mb: 3, bgcolor: "background.default", top: 0, width: "100%", textTransform: "uppercase", fontWeight: "bold", textAlign: "center"}} variant='h2' fontSize={{xs: "45px", sm: "60px"}}>Nexabank</Typography>
        <Paper sx={{p: {xs: 1, sm: 3}, margin: "0 auto", mt: 22, width: "100%", flex: {xs: 1, sm: "none"}, maxWidth: {xs: "none", sm: 450}}}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{pointerEvents: !loadingForm ? "auto" : "none"}}>
              <Typography variant='h5' sx={{textAlign: "center", fontWeight: "bold"}} >{t("login")}</Typography>
              <TextField size="medium" label="Email" value={email} onChange={(e) => setForm({key: "email", value: e.target.value})}/>
              <PasswordField 
                value={password}
                onChange={(e) => setForm({key: "password", value: e.target.value})}
                showPassword={showPassword} 
                onTogglePassword={() => setShowPassword(prev => !prev)}
              />
              {error && <FormHelperText error>{t("error")}</FormHelperText>}
              <Typography textAlign={"center"}>
                {t("view.login.link_text") + " "} 
                <MuiLink 
                  component={Link} 
                  to={"/signin"}
                >
                  {t("signin")}
                </MuiLink>
              </Typography>
              <Button size="large" variant="contained" disabled={loadingForm} type="submit" endIcon={loadingForm && <CircularProgress size={20}/>}>{t("login")}</Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Box>
  )
}

export default Login