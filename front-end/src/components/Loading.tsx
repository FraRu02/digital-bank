import { Box, CircularProgress, Modal, Typography } from "@mui/material";
import React from "react";

const style = {
  // bgcolor: 'background.paper',
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100vw",
  height: "100vh",
};

type LoadingProps = {
  fullScreen?: boolean;
}


const Loading:React.FC<LoadingProps> = ({fullScreen=false}) => {
  return fullScreen ? (
    <Box sx={{display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}}>
      {/* <Typography variant="h4">Loading...</Typography> */}
      <CircularProgress />
    </Box>
  ): (
    <CircularProgress />
  )
}

// const Loading:React.FC<LoadingProps> = ({fullScreen=false}) => {
//   return fullScreen ? (
//     <Modal
//       open={true}
//     >
//       <Box sx={style}>
//         {/* <Typography variant="h4">Loading...</Typography> */}
//         <CircularProgress />
//       </Box>
//     </Modal>
//   ): (
//     <CircularProgress />
//   )
// }

export default Loading