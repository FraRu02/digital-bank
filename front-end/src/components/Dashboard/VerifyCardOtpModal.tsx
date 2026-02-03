import React, { useCallback } from 'react';
import CustomModal from '../CustomModal';
import VerifyCardOtp from '../Cards/VerifyCardOtp';
import { useDashboardView } from '@/src/views/Dashboard';

type VerifyCardOtpModalProps = {
  open?: boolean;
  onClose?: () => void;
}

const VerifyCardOtpModal:React.FC<VerifyCardOtpModalProps> = ({open=false, onClose}) => {
  const {cardToVerify, setCardToVerifyId, setSelectedCardId} = useDashboardView();

  const handleClose = useCallback(() => {
    setCardToVerifyId(null);
    onClose?.();
  }, [onClose])

  const handleVerify = useCallback(() => {
    setSelectedCardId(cardToVerify?.id);
    handleClose();
  }, [cardToVerify, handleClose])

  return (
    <CustomModal open={open} onClose={handleClose}>
      <VerifyCardOtp card={cardToVerify} onVerify={handleVerify}/>
    </CustomModal>
  )
}

export default VerifyCardOtpModal