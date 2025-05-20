import { useEffect } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import PropTypes from "prop-types";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    borderRadius: 2,
    textAlign: "center",
};

const notificationConfig = {
    success: {
        icon: (
            <CheckCircleIcon
                sx={{ fontSize: 60, color: "success.main", mb: 2 }}
            />
        ),
        title: "Успешно",
        buttonColor: "success",
    },
    error: {
        icon: <ErrorIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />,
        title: "Ошибка",
        buttonColor: "error",
    },
    warning: {
        icon: (
            <WarningIcon sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
        ),
        title: "Внимание",
        buttonColor: "warning",
    },
};

export default function NotificationModal({
    open,
    onClose,
    type = "success",
    message = "",
    duration = 3000,
}) {
    const config = notificationConfig[type] || notificationConfig.success;

    // Автозакрытие через duration
    useEffect(() => {
        if (open && duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [open, duration, onClose]);

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                {config.icon}
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {config.title}
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ mb: 3, whiteSpace: "pre-line" }}
                >
                    {String(message)}
                </Typography>
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        bgcolor: `${config.buttonColor}.main`,
                        px: 4,
                        "&:hover": {
                            bgcolor: `${config.buttonColor}.dark`,
                        },
                    }}
                >
                    OK
                </Button>
            </Box>
        </Modal>
    );
}

NotificationModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    type: PropTypes.oneOf(["success", "error", "warning"]),
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    duration: PropTypes.number,
};
