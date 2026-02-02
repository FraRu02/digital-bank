import React, { useCallback } from 'react';
import CustomModal from '../CustomModal';
import VerifyCardOtp from '../Cards/VerifyCardOtp';
import { useDashboardView } from '@/src/views/Dashboard';

type VerifyCardOtpModalProps = {
  open?: boolean;
  onClose?: () => void;
}

const VerifyCardOtpModal:React.FC<VerifyCardOtpModalProps> = ({open=false, onClose}) => {
  const {cardToVerify, setCardToVerify} = useDashboardView();

  const handleClose = useCallback(() => {
    setCardToVerify(null);
    onClose?.();
  }, [onClose])

  return (
    <CustomModal open={open} onClose={handleClose}>
      <VerifyCardOtp card={cardToVerify} onVerify={onClose}/>
    </CustomModal>
  )
}

export default VerifyCardOtpModal