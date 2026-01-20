import React, { useCallback, useMemo } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import type { StoreProps } from '@/src/store/rootReducer';
import { useTranslation } from 'react-i18next';
import Utilities from '@/src/classes/Utilities';

const ProfileContent:React.FC = () => {
  const {t} = useTranslation();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const userFields = useMemo(() => {
    if(!user) return;
    const copy = Utilities.deepCopyObjects(user as any);
    copy.tax_code = user.taxCode;
    copy.Email = user.email;
    copy.creation_date = user.createdAt;
    delete copy.id;
    delete copy.taxCode;
    delete copy.email;
    delete copy.createdAt;
    delete copy.updatedAt;
    return copy;
  }, [user])

  const getRow = useCallback((key: string, value:string) => {
    const date = new Date(value)?.toLocaleDateString();
    const formattedDate = date !== "Invalid Date" ? date : null;
    return (
      <Stack key={key} spacing={1} direction={"row"} flexWrap="wrap">
        <Typography sx={{flex: 1, maxWidth: 200}}>{t(key)}:</Typography>
        <Typography sx={{flex: 1, maxWidth: 200}} fontWeight={"bold"} textAlign={"right"}>{formattedDate ?? t(value)}</Typography>
      </Stack>
    )
  }, [t])

  return (
    <Box sx={{p: 1}}>
      <Typography sx={{mb: 2}} fontWeight={"bold"} variant='h5'>{t("profile")}</Typography>
      {userFields &&
      <Stack spacing={0.5}>
        {Object.keys(userFields).map((key) => (
          getRow(key, userFields[key])
        ))}
      </Stack>

      }
    </Box>
  )
}

export default ProfileContent