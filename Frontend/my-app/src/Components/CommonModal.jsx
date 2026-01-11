import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const CommonModal = ({
  open,
  onClose,
  title = "Message",
  message = "",
  buttonText = "OK",
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          color="error"
        >
          {title}
        </Typography>

        <Typography sx={{ mt: 2 }}>
          {message}
        </Typography>

        <Button
          variant="contained"
          sx={{
            mt: 3,
            bgcolor: "#008000",
            "&:hover": { bgcolor: "#006400" },
          }}
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </Box>
    </Modal>
  );
};

export default CommonModal;
