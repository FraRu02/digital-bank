import { Box, Button, CircularProgress, FormHelperText, Paper, Link as MuiLink, Stack, TextField, Typography, useTheme } from '@mui/material'
import React, { useCallback, useState } from 'react'
import useForm from '@/src/hooks/useForm'
import { signin } from '@/src/store/auth/authActions';
import { useSelector } from 'react-redux';
import type { StoreProps } from '../store/rootReducer';
import { Link, Navigate } from 'react-router-dom';
import { RoutePath } from '@/src/routesConfig';
import PasswordField from '@/src/components/inputs/PasswordField';
import { useTranslation } from 'react-i18next';
import ThemeSwitch from '@/src/components/ThemeSwitch';
import LanguageSwitch from '@/src/components/LanguageSwitch';

const initialForm = {
  name: "",
  lastname: "",
  email: "",
  password: "",
  taxCode: "",
}

const Signin = () => {
  const {t} = useTranslation();
  const {loading, isAuthenticated} = useSelector((state:StoreProps) => state.auth);
  const {form, setForm, loading:loadingForm, error, onSend} = useForm(initialForm);
  const {name, lastname, email, password, taxCode} = form;
  const [showPassword, setShowPassword] = useState(false);
  

  const handleSubmit = useCallback(async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = await onSend(signin(name, lastname, email, taxCode, password));
    if(!data.error) setForm({newState: initialForm});
  }, [form]);

  if(!loading && isAuthenticated) return <Navigate to={RoutePath['/']}/> 


  return (
    <Box sx={{ width: "100vw", height: "100vh"}}>
      <Stack sx={{position: "fixed", top: 0, right: 0, zIndex: 10, p: 1}} direction={"row"}>
        <ThemeSwitch />
        <LanguageSwitch />
      </Stack>
      <Stack sx={{width: "100%", height: "100%", gap: "1rem"}}>
        <Typography sx={{position: "fixed", pt: 10, zIndex: 5, mb: 3, bgcolor: "background.default", top: 0, width: "100%", textTransform: "uppercase", fontWeight: "bold", textAlign: "center"}} variant='h2' fontSize={{xs: "45px", sm: "60px"}}>Nexabank</Typography>
        <Paper sx={{p: {xs: 1, sm: 3}, margin: "0 auto", mt: 22, width: "100%", flex: {xs: 1, sm: "none"}, maxWidth: {xs: "none", sm: 450}}}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{position: "relative", pointerEvents: !loadingForm ? "auto" : "none"}}>
              <Typography variant='h5' sx={{textAlign: "center", fontWeight: "bold"}}>{t("signin")}</Typography>
              <TextField size="medium" label={t("name")} value={name} onChange={(e) => setForm({key: "name", value: e.target.value})}/>
              <TextField size="medium" label={t("lastname")} value={lastname} onChange={(e) => setForm({key: "lastname", value: e.target.value})}/>
              <TextField size="medium" label="Email" value={email} onChange={(e) => setForm({key: "email", value: e.target.value})}/>
              <TextField size="medium" label={t("tax_code")} value={taxCode} onChange={(e) => setForm({key: "taxCode", value: e.target.value})}/>
              <PasswordField 
                value={password}
                onChange={(e) => setForm({key: "password", value: e.target.value})}
                showPassword={showPassword} 
                onTogglePassword={() => setShowPassword(prev => !prev)}
              />
              {error && <FormHelperText error>{t("error")}</FormHelperText>}
              <Typography textAlign={"center"}>
                {t("view.signin.link_text") + " "} 
                <MuiLink 
                  component={Link} 
                  to={"/login"}
                >
                  {t("login")}
                </MuiLink>
              </Typography>
              <Button size="large" variant="contained" disabled={loadingForm} type="submit" endIcon={loadingForm && <CircularProgress size={20}/>}>{t("signin")}</Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Box>
  )
}

export default Signin