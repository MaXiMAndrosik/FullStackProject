import React, { useState, useEffect } from "react";
import apiClient from "../../../app/api/client";
import { format } from "date-fns";
import { Box, Container } from "@mui/material";
import {
    showSuccess,
    showError,
} from "../../../shared/services/notificationService";
import VerificationTable from "./components/VerificationTable";
import VerificationDialog from "./components/VerificationDialog";

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
            const response = await apiClient.get(
                "/admin/verification-requests"
            );
            setRequests(response.data.requests || []);
        } catch (error) {
            showError("Ошибка загрузки запросов на верификацию");
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return dateString ? format(new Date(dateString), "dd.MM.yyyy") : "";
    };

    // Форматирование данных для DataGrid
    const formattedRequests = requests.map((request) => {
        const fullName =
            request.last_name +
            " " +
            request.first_name +
            " " +
            request.patronymic;
        return {
            ...request,
            fullName: fullName,
            formatted_birth_date: formatDate(request.birth_date),
            formatted_created_at: formatDate(request.created_at),
        };
    });

    const handleShowDetails = (request) => {
        setSelectedRequest(request);
        setDetailModal(true);
    };

    // Подтверждение верификации собственника
    const handleApprove = async (requestId) => {
        try {
            await apiClient.post(`/admin/verification/${requestId}/approve`);
            showSuccess("Собственник успешно верифицирован");
            fetchVerificationRequests();
            setDetailModal(false);
        } catch (error) {
            showError("Ошибка подтверждения");
        }
    };

    //  Отказ верификации собственника
    const handleReject = async (requestId) => {
        try {
            await apiClient.post(`/admin/verification/${requestId}/reject`);
            showSuccess("Запрос отклонен");
            fetchVerificationRequests();
            setDetailModal(false);
        } catch (error) {
            showError("Ошибка отклонения запроса");
        }
    };

    const handleDelete = async (requestId) => {
        if (
            !window.confirm(
                "Вы уверены, что хотите удалить этот запрос? Данное действие необратимо."
            )
        ) {
            return;
        }

        try {
            await apiClient.delete(`/admin/verification-requests/${requestId}`);
            showSuccess("Запрос удален");
            fetchVerificationRequests();
            setDetailModal(false);
        } catch (error) {
            showError("Ошибка удаления: " + error.message);
        }
    };

    return (
        <Box
            component="section"
            sx={(theme) => ({
                width: "100%",
                backgroundRepeat: "no-repeat",
                backgroundImage:
                    "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
                ...theme.applyStyles("dark", {
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                }),
            })}
        >
            <Container
                maxWidth={false}
                sx={{
                    pt: { xs: 14, sm: 8 },
                    pb: { xs: 8, sm: 8 },
                    width: "100%",
                    mb: 3,
                }}
            >
                <VerificationTable
                    requests={formattedRequests}
                    loading={loading}
                    onViewDetails={handleShowDetails}
                />
            </Container>

            <VerificationDialog
                open={detailModal}
                onClose={() => setDetailModal(false)}
                request={selectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
            />
        </Box>
    );
};

export default AdminVerificationPanel;
