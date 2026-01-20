import React, { useCallback, useState } from 'react';

type SetOpenModalProps = {
  open: false
}|{
  open: true;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}


const useConfirmModal = (options?: SetOpenModalProps) => {
  const [modal, setModal] = useState<{
    open: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    onClose?: () => void;
  }>(options ?? {open: false});

  const setOpen = useCallback((options: SetOpenModalProps) => {
    const {open} = options;
    if(!open) setModal({open});
    else 
      setModal({...options, 
        onClose: () => {
          options.onClose?.();
          setModal({open: false});
        },
        onCancel: () => {
          options.onCancel?.();
          setModal({open: false});
        }
      });
  }, [])

  return {
    modal,
    setModal: setOpen
  }
}

export default useConfirmModal