import React, { createContext, useContext, useMemo, useState } from 'react';
import CustomModal from '@/src/components/CustomModal';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreateBankAccountTab from './CreateBankAccountTab';
import CreateCardTab from './CreateCardTab';

type CreateBankingServiceModalProps = {
  open?: boolean;
  onClose?: () => void;
}

type CreateBankingServiceModalContexProps = {
  closeModal?: () => void;
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>
}

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const getTabProps = (index: number) => {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const TabPanel:React.FC<TabPanelProps> = ({children, value, index}) => {

  return (
    <div
      style={{flex: 1, overflowY: "auto"}}
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
    >
      {value === index && (
        children
      )}
    </div>
  );
}

const CreateBankingServiceModalContex = createContext<CreateBankingServiceModalContexProps|undefined>(undefined);
export const useCreateBankingServiceModal = () => useContext(CreateBankingServiceModalContex)!;
const CreateBankingServiceModal:React.FC<CreateBankingServiceModalProps> = ({open=false, onClose}) => {
  const {t} = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [isPending, setIsPending] = useState(false);

  const value = useMemo(():CreateBankingServiceModalContexProps => {
    return {
      closeModal: onClose,
      setIsPending
    }
  }, [onClose])

  return (
    <CreateBankingServiceModalContex.Provider value={value}>
      <CustomModal containerBox={{sx: {height: "80vh"}}}  open={open} onClose={!isPending ? onClose : undefined}>
        <Stack height={"100%"} spacing={2}>
          <Tabs
            value={tabValue}
            onChange={(e, value) => setTabValue(value)}
          >
            <Tab label={t("modal.create.bank_account.title")} {...getTabProps(0)} />
            <Tab label={t("modal.create.card.title")} {...getTabProps(1)} />
          </Tabs>
          <Box height={"100%"} sx={{ overflowY: "auto"}}>
            <TabPanel value={tabValue} index={0}>
              <CreateBankAccountTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <CreateCardTab />
            </TabPanel>
          </Box>
        </Stack>
      </CustomModal>
    </CreateBankingServiceModalContex.Provider>
  )
}

export default CreateBankingServiceModal