import React, { createContext, useCallback, useContext } from 'react';
import { Box, List as MuiList, ListItem, ListItemText, Skeleton, Stack, Typography, useMediaQuery, useTheme, type SxProps, type Theme, Button, type ButtonProps, CircularProgress, type ListProps as MuiListProps } from '@mui/material';
import type { AlertProps } from '@/src/classes/Alert';
import { useTranslation } from 'react-i18next';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import Alert from '@/src/classes/Alert';

type AlertsListContextProps = {
  deleteMutation: UseMutationResult<void, Error, any, unknown>;
  alerts?: AlertProps[];
  loading?: boolean;
}

type RootProps = {
  children?: React.ReactNode;
  alerts?: AlertProps[];
  loading?: boolean;
}

const AlertsListContext = createContext<AlertsListContextProps|undefined>(undefined);

const useAlertsList = () => useContext(AlertsListContext)!;

const Root:React.FC<RootProps> = ({children, alerts, loading}) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (params:any) => Alert.deleteMe(params),
    onSuccess: (data, variables) => {
      if(!variables) return;
      console.log(variables)
      queryClient.setQueryData(
        ["alerts"],
        (oldData: AlertProps[]) => {
          if(Array.isArray(variables)) {
            if(variables.length === 0) return [];
            return oldData.filter((e) => !variables.includes(e.id));
          }else {
            return oldData.filter((e) => e.id !== variables);
          }
        }
      );
    }
  });

  const value:AlertsListContextProps = {
    deleteMutation,
    alerts,
    loading
  }

  return (
    <AlertsListContext.Provider value={value}>
      {children}
    </AlertsListContext.Provider>
  )
}

const List:React.FC<MuiListProps> = () => {
  const {deleteMutation, alerts, loading} = useAlertsList();
  const {t, i18n} = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const handleDelete = useCallback((alert:AlertProps) => {
    deleteMutation.mutate(alert.id);
  }, [])

  const getFormattedDate = useCallback((dateString:string):string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate()-1);
    const compareDate = new Date(dateString);
    compareDate.setHours(0, 0, 0, 0);
    if(compareDate.getTime() === today.getTime()) {
      return t("today") + ", " + new Date(dateString).toLocaleString(i18n.language, {
        hour: '2-digit',
        minute: '2-digit',
      });
    }else if(compareDate.getTime() === yesterday.getTime()) {
      return t("yesterday") + ", " + new Date(dateString).toLocaleString(i18n.language, {
        hour: '2-digit',
        minute: '2-digit',
      });;
    }
    return new Date(dateString).toLocaleString(i18n.language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [t])

  const trailingActions = useCallback((alert:AlertProps) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => handleDelete(alert)}
      >
        <Box sx={{bgcolor: "error.main", width: 60, display: "flex", alignItems: "center", justifyContent: "center"}}>
          <DeleteIcon sx={{color: "error.contrastText"}}/>
        </Box>
      </SwipeAction>
    </TrailingActions>
  ), []);

  if(loading) return (
    <Stack spacing={1}>
      {new Array(5).fill(0).map((e, index) => (
        <Skeleton key={index} variant="rounded" height={50}/>
      ))}
    </Stack>
  )

  return alerts && alerts.length > 0 && (
    <MuiList>
      <SwipeableList 
        fullSwipe
        type={ListType.IOS}
        destructiveCallbackDelay={0}
      >
        {alerts.map((e) => (
          <SwipeableListItem key={e.id} trailingActions={isMobile ? trailingActions(e) : undefined}>
            <ListItem divider>
              <Stack width={"100%"} spacing={1}>
                <ListItemText primary={e.content} secondary={e.senderDescription} />
                <Typography style={{marginLeft: "auto"}} variant="caption">{getFormattedDate(e.createdAt)}</Typography>
              </Stack>
            </ListItem>
          </SwipeableListItem>
        ))}
      </SwipeableList>
    </MuiList>
  )
}

type EmptyProps = {
  children?:React.ReactNode;
  sx?: SxProps<Theme>;
}

const Empty:React.FC<EmptyProps> = ({sx, children}) => {
  const {t} = useTranslation();
  const {alerts} = useAlertsList();
  
  if(children) return children;
  
  return alerts && alerts.length <= 0 && (
    <Box sx={sx}>
      <NotificationsOffIcon sx={{fontSize: "2rem"}}/>
      <Typography>{t("no_notifications")}</Typography>
    </Box>
  )
}

const DeleteButton:React.FC<ButtonProps> = ({...otherProps}) => {
  const {t} = useTranslation();
  const {deleteMutation} = useAlertsList();


  return (
    <Button
      variant="outlined"
      color='error'
      disabled={deleteMutation.isPending}
      onClick={() => deleteMutation.mutate([])} 
      startIcon={<DeleteIcon />} 
      endIcon={deleteMutation.isPending ? <CircularProgress color='error' size={15}/>: null}
      {...otherProps}
    >
      {t("delete")}
    </Button>
  )
}


const AlertsList = {
  Root,
  List,
  Empty,
  DeleteButton
}

export default AlertsList