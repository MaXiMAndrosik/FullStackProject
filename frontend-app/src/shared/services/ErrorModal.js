import { Modal, Box, Typography, Button } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import LockIcon from "@mui/icons-material/Lock";

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

const errorMessages = {
    401: {
        title: "Требуется авторизация",
        defaultMessage:
            "Пожалуйста, войдите в систему для доступа к этому функционалу",
        icon: (
            <WarningIcon sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
        ),
    },
    403: {
        title: "Доступ запрещен",
        defaultMessage: "У вас недостаточно прав для этого действия",
        icon: <LockIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />,
    },
    default: {
        title: "Ошибка",
        defaultMessage: "Произошла непредвиденная ошибка",
        icon: <WarningIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />,
    },
};

export default function ErrorModal({ open, onClose, status, message }) {
    const { title, defaultMessage, icon } =
        errorMessages[status] || errorMessages.default;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                {icon}
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    {message || defaultMessage}
                </Typography>
                <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                        bgcolor: status === 401 ? "warning.main" : "error.main",
                        px: 4,
                        "&:hover": {
                            bgcolor:
                                status === 401 ? "warning.dark" : "error.dark",
                        },
                    }}
                >
                    Понятно
                </Button>
            </Box>
        </Modal>
    );
}
