import React from 'react';
import CustomModal, { type CustomModalProps } from '@/src/components/CustomModal'
import { alpha, Box, Button, CircularProgress, Stack, Typography, useTheme } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';

type WarningModalProps = {
  modalOptions: Omit<CustomModalProps, "children">;
  title?: React.ReactNode;
  contentText?: React.ReactNode;
  warningText?: React.ReactNode;
  content?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const WarningModal:React.FC<WarningModalProps> = ({modalOptions, title, contentText, warningText, content, onConfirm, onCancel}) => {
  const {t} = useTranslation();
  const color = useTheme();
  const alphaColor = alpha(color.palette.warning.main, 0.2);
  return (
    <CustomModal {...modalOptions}>
      {!content ?
      <Stack spacing={2}>
        <Stack spacing={1} alignItems={"center"}>
          <WarningAmberIcon sx={{fontSize: "4rem"}} color="warning" />
          <Typography sx={{fontWeight: "bold", textAlign: "center"}} variant='h5' color='warning'>{title ?? t("modals.warning.title")}</Typography>
        </Stack>
        <Typography>{contentText}</Typography>
        {warningText && 
        <Stack direction={"row"} >
          <Box sx={{width: "10px", bgcolor: "warning.main"}} />
          <Stack flex={1} spacing={2} sx={{p: 1, color: "warning.main", bgcolor: alphaColor}}>
            <Stack direction={"row"} spacing={1}>
              <WarningAmberIcon sx={{fontWeight: "bold"}} color="warning" />
              <Typography sx={{fontWeight: "bold"}}>{t("warning")}</Typography>
            </Stack>
            <Typography>{warningText}</Typography>
          </Stack>
        </Stack>
        }
        <Stack style={{marginLeft: "auto"}} direction={"row"} spacing={1}>
          <Button onClick={onCancel}>{t("cancel")}</Button>
          <Button variant="contained" onClick={onConfirm}>{t("confirm")}</Button>
        </Stack>
      </Stack>
      :
      content
      }
    </CustomModal>
  )
}

export default WarningModal