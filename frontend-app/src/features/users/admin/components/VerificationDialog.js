import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    Chip,
    Stack,
    IconButton,
} from "@mui/material";
import {
    Close as CloseIcon,
    Check as ApproveIcon,
    Clear as RejectIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

const VerificationDialog = ({
    open,
    onClose,
    request,
    onApprove,
    onReject,
    onDelete,
}) => {
    const formatDate = (dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    };

    if (!request) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6">
                        Запрос на верификацию: {request.last_name}{" "}
                        {request.first_name}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Основная информация
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                ФИО
                            </Typography>
                            <Typography>
                                {request.last_name} {request.first_name}{" "}
                                {request.patronymic}
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Дата рождения
                            </Typography>
                            <Typography>
                                {formatDate(request.birth_date)}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Телефон
                            </Typography>
                            <Typography>{request.phone}</Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Квартира
                            </Typography>
                            <Typography>№{request.apartment_number}</Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Дата подачи заявки
                            </Typography>
                            <Typography>
                                {formatDate(request.created_at)}
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Статус
                            </Typography>
                            <Chip
                                label={
                                    request.status === "pending"
                                        ? "Ожидает"
                                        : request.status === "approved"
                                        ? "Подтвержден"
                                        : "Отклонен"
                                }
                                color={
                                    request.status === "pending"
                                        ? "warning"
                                        : request.status === "approved"
                                        ? "success"
                                        : "error"
                                }
                                size="small"
                            />
                        </Box>
                    </Stack>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Информация о пользователе
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Stack direction="row" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Имя пользователя
                            </Typography>
                            <Typography>
                                {request.user?.name || "Не указано"}
                            </Typography>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Email
                            </Typography>
                            <Typography>
                                {request.user?.email || "Не указано"}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
                <Box>
                    {request.status === "pending" && (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<RejectIcon />}
                            onClick={() => onReject(request.id)}
                            sx={{ mr: 1 }}
                        >
                            Отклонить
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color={
                            request.status === "pending" ? "success" : "primary"
                        }
                        startIcon={
                            request.status === "pending" ? (
                                <ApproveIcon />
                            ) : null
                        }
                        onClick={() =>
                            request.status === "pending"
                                ? onApprove(request.id)
                                : onDelete(request.id)
                        }
                    >
                        {request.status === "pending"
                            ? "Подтвердить"
                            : "Удалить"}
                    </Button>
                </Box>

                <Button variant="outlined" onClick={onClose}>
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VerificationDialog;
