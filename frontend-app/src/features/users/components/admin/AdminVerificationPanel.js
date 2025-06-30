import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
} from "@mui/material";

const AdminVerificationPanel = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailModal, setDetailModal] = useState(false);

    useEffect(() => {
        fetchVerificationRequests();
    }, []);

    const fetchVerificationRequests = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "/api/admin/verification-requests"
            );
            setRequests(response.data.data);
        } catch (error) {
            console.error("Ошибка загрузки запросов:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await axios.post(`/api/admin/verification/${requestId}/approve`);
            setRequests(requests.filter((req) => req.id !== requestId));
            setDetailModal(false);
        } catch (error) {
            console.error("Ошибка подтверждения:", error);
        }
    };

    const handleShowDetails = (request) => {
        setSelectedRequest(request);
        setDetailModal(true);
    };

    return (
        <div className="admin-verification">
            <Typography variant="h5" gutterBottom>
                Запросы на верификацию
            </Typography>

            {loading ? (
                <CircularProgress />
            ) : requests.length === 0 ? (
                <Typography>Нет запросов на верификацию</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Пользователь</TableCell>
                                <TableCell>ФИО</TableCell>
                                <TableCell>Квартира</TableCell>
                                <TableCell>Дата запроса</TableCell>
                                <TableCell>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.user.email}</TableCell>
                                    <TableCell>
                                        {request.last_name} {request.first_name}
                                    </TableCell>
                                    <TableCell>
                                        №{request.apartment_number}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            request.created_at
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() =>
                                                handleShowDetails(request)
                                            }
                                        >
                                            Подробности
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            style={{ marginLeft: 8 }}
                                            onClick={() =>
                                                handleApprove(request.id)
                                            }
                                        >
                                            Подтвердить
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Модальное окно с деталями */}
            <Dialog
                open={detailModal}
                onClose={() => setDetailModal(false)}
                maxWidth="md"
            >
                {selectedRequest && (
                    <>
                        <DialogTitle>
                            Запрос на верификацию от{" "}
                            {selectedRequest.user.email}
                        </DialogTitle>
                        <DialogContent dividers>
                            <div className="request-details">
                                <div className="detail-row">
                                    <span className="label">ФИО:</span>
                                    <span>
                                        {selectedRequest.last_name}{" "}
                                        {selectedRequest.first_name}{" "}
                                        {selectedRequest.patronymic}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">
                                        Дата рождения:
                                    </span>
                                    <span>
                                        {new Date(
                                            selectedRequest.birth_date
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Телефон:</span>
                                    <span>{selectedRequest.phone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Паспорт:</span>
                                    <span>
                                        {selectedRequest.passport_series}{" "}
                                        {selectedRequest.passport_number}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Выдан:</span>
                                    <span>
                                        {selectedRequest.passport_issued_by}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Дата выдачи:</span>
                                    <span>
                                        {new Date(
                                            selectedRequest.passport_issued_date
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Квартира:</span>
                                    <span>
                                        №{selectedRequest.apartment_number}
                                    </span>
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailModal(false)}>
                                Закрыть
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                    handleApprove(selectedRequest.id)
                                }
                            >
                                Подтвердить верификацию
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default AdminVerificationPanel;
