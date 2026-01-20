import { Box, Paper, Stack, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AlertsList from '@/src/components/Alerts/AlertsList';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Alert, { type AlertProps } from '@/src/classes/Alert';
import { useSocket } from '@/src/context/SocketProvider';
import { toast } from 'react-toastify';
import NotificationsIcon from '@mui/icons-material/Notifications';

const AlertsChip:React.FC = () => {
  const {t} = useTranslation();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const {data, isFetching} = useQuery<AlertProps[]>({
    queryKey: ["alerts"],
    queryFn: Alert.getMe
  });


  useEffect(() => {

    socket.on("new-transaction", (data:AlertProps) => {
      toast.success(data.title);
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['bankAccount'] })
      queryClient.invalidateQueries({ queryKey: ['incExp'] })
      queryClient.setQueryData(
        ["alerts"],
        (oldData: any) => {
          if (!oldData) return [data];
          return [data, ...oldData];
        }
      );
    })

    return () => {
      socket.off("new-transaction");
    }
  }, [])

  return (
    <AlertsList.Root alerts={data} loading={isFetching}>
      <Paper sx={{p: "1rem", height: "100%"}}>
        <Stack sx={{height: "100%"}} spacing={1}>
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            <NotificationsIcon />
            <Typography>{t("alert_other")}</Typography>
            {data && data?.length > 0 &&
            <>
              <Box style={{height: "fit-content"}} sx={{display: "flex", px: 0.5, alignItems: "center", justifyContent: "center", borderRadius: "50%", bgcolor: "error.main"}}>
                <Typography sx={{color: "error.contrastText"}} variant='caption'>{data?.length}</Typography>
              </Box>
              <AlertsList.DeleteButton style={{marginLeft: "auto"}}/>
            </> 
            }
          </Stack>
          <Box sx={{flex: 1, overflowY: "auto"}}>
            <AlertsList.List/>
            <AlertsList.Empty sx={{
                display: "flex",
                height: "100%",
                flexDirection: "column",
                gap: "0.5rem",
                width: "100%",
                alignItems: "center",
                justifyContent: "center"
            }}/>
          </Box>
        </Stack>
      </Paper>
    </AlertsList.Root>
  )
}

export default AlertsChip