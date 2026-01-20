import React, { useCallback, useMemo, useState } from 'react';
import { CircularProgress, IconButton, Paper, Stack, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { BaseCardProps } from '@/src/classes/Card';
import ChipImage from "@/src/assets/img/chip_nobg.png";
import { darkTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SecretTypography from './SecretTypography';

type CardElementProps = {
  card: BaseCardProps;
  selected?: boolean;
  loading?: boolean;
}

const CardElement:React.FC<CardElementProps> = ({card, selected, loading}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [hide, setHide] = useState<boolean>(true);
  const textColor = useMemo(() => {
    if(selected && theme.palette.mode === "light") {
      return darkTheme.palette.text.primary;
    }
    return "inherit"
  }, [theme.palette.mode, selected])

  const handleToggleHide = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    setHide(prev => !prev);
  }, []);


  return (
    <Paper sx={{width: 400, p: "1rem 2rem", bgcolor: selected ? "#1c2370" : undefined, color: textColor}}>
      <Stack spacing={3}>
        <Stack spacing={1} direction={"row"} alignItems={"center"}>
          {loading ?
          <CircularProgress sx={{color: "red"}} size={20}/>
          :
          selected && <CheckCircleIcon sx={{color: "lightgreen"}}/>
          }
          <Typography sx={{textTransform: "uppercase"}}>{t("card_one")}</Typography>
          <IconButton sx={{color: textColor}} onClick={handleToggleHide}>
            {hide ?
              <Visibility />
              :
              <VisibilityOff />
            }
          </IconButton>
          <Typography sx={{textTransform: "uppercase"}} variant="caption" style={{marginLeft: "auto"}}>{t(card.type)}</Typography>
        </Stack>
        <Stack spacing={1} direction={"row"} alignItems={"center"}>
          <img style={{width: 50}} src={ChipImage} />
          <SecretTypography hide={hide} end={-3} style={{marginLeft: "auto"}}>{card.number}</SecretTypography>
        </Stack>
        <Stack spacing={1} justifyContent={"space-between"} direction={"row"}>
          <Stack spacing={1}>
            <Typography>{t("expires")}</Typography>
            <SecretTypography hide={hide}>{new Date(card.expire).toLocaleDateString()}</SecretTypography>
          </Stack>
          <Stack spacing={1}>
            <Typography>CVV</Typography>
            <SecretTypography hide={hide}>{card.cvv}</SecretTypography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

CardElement.displayName = "CardElement";
export default CardElement