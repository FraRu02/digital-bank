import React, { createContext, useContext, useMemo, useState } from 'react';
import CustomModal from '@/src/components/CustomModal';
import TransferMoneyTab from './TransferMoneyTab';

type OperationsModalProps = {
  open?: boolean;
  onClose?: () => void;
}


type OperationsModalContextProps = {
  closeModal?: () => void;
  setIsPending: React.Dispatch<React.SetStateAction<boolean>>;
}
const OperationsModalContext = createContext<OperationsModalContextProps|undefined>(undefined);
export const useOperationsModal = () => useContext(OperationsModalContext)!;

const OperationsModal:React.FC<OperationsModalProps> = ({open=false, onClose}) => {
  const [isPending, setIsPending] = useState(false);

  const value = useMemo(():OperationsModalContextProps => {
    return {
      closeModal: onClose,
      setIsPending
    }
  }, [onClose])


  return (
    <OperationsModalContext.Provider value={value}>
      <CustomModal open={open} onClose={!isPending ? onClose : undefined}>
        <TransferMoneyTab />
      </CustomModal>
    </OperationsModalContext.Provider>
  )
}

export default OperationsModal