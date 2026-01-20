import { Box, Modal, Paper, type BoxProps, type ModalProps, type PaperProps, type SxProps, type Theme} from '@mui/material';
import React from 'react'

const modalStyle:SxProps<Theme> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  // bgcolor: 'background.paper',
  // boxShadow: 24,
  width: "95vw",
  maxWidth: 700,
};

export type CustomModalProps = Omit<ModalProps, "children"> & {
  children: React.ReactNode;
  containerBox?: PaperProps;
}

const CustomModal:React.FC<CustomModalProps> = ({children, containerBox, ...otherProps}) => {
  const {sx, ...boxProps} = containerBox ? containerBox : {};
  return (
     <Modal
      {...otherProps}
    >
      <Paper sx={{p: {xs: 2, sm: 4}, ...modalStyle, ...sx}} {...boxProps}>
        {children}
      </Paper>
    </Modal>
  )
}

export default CustomModal