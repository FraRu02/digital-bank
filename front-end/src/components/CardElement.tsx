import React, { useCallback, useMemo, useState } from 'react';
import { Button, CircularProgress, IconButton, Paper, Stack, Typography, useTheme, type PaperProps, type SxProps, type Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CardStatus, type BaseCardProps } from '@/src/classes/Card';
import ChipImage from "@/src/assets/img/chip_nobg.png";
import { darkTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SecretTypography from './SecretTypography';
import PendingIcon from '@mui/icons-material/Pending';

type CardElementProps = {
  card: BaseCardProps;
  sx?: SxProps<Theme>
  selected?: boolean;
  loading?: boolean;
  onClickVerify?: (card:BaseCardProps) => void;
}

const CardElement:React.FC<CardElementProps> = ({sx, card, selected, loading, onClickVerify}) => {
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

  if(card.status === CardStatus.pending_verification) {
    return (
      <Paper sx={{
        p: "1rem 2rem",
        ...sx
      }}>
        <Stack spacing={3}>
          <Stack spacing={1} direction={"row"} alignItems={"center"}>
            {loading ?
            <CircularProgress sx={{color: "red"}} size={20}/>
            :
            selected && <PendingIcon sx={{color: "warning.main"}}/>
            }
            <Typography sx={{textTransform: "uppercase"}}>{t("card_one")}</Typography>
            <Typography sx={{textTransform: "uppercase"}} variant="caption" style={{marginLeft: "auto"}}>{t(card.type)}</Typography>
          </Stack>
          <Stack height={"100%"} alignItems={"center"} spacing={1}>
            <Typography>Questa carta è in attesa di essere verificata</Typography>
            <Button
              onClick={() => {console.log(card); onClickVerify?.(card)}}
            >
              {t("verify_card")}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    )
  }else if(card.status === CardStatus.active){
    return (
      <Paper sx={{p: 1.5, bgcolor: selected ? "#1c2370" : undefined, color: textColor, ...sx}}>
        <Stack sx={{ height: "100%"}} spacing={1} justifyContent={"space-between"}>
          <Stack spacing={0.5} direction={"row"} alignItems={"center"}>
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
            <Stack spacing={0.5}>
              <Typography>{t("expires")}</Typography>
              <SecretTypography hide={hide}>{new Date(card.expire).toLocaleDateString()}</SecretTypography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography>CVV</Typography>
              <SecretTypography hide={hide}>{card.cvv}</SecretTypography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    )
  }


}

CardElement.displayName = "CardElement";
export default CardElement