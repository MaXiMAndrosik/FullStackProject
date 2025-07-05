import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import apiClient from "../../app/api/client";
import { fetchCurrentUser, clearAuth } from "../auth/model/authSlice";
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Stack,
    Alert,
} from "@mui/material";
import * as Yup from "yup";
import UserProfileForm from "./components/user/UserProfileForm";
import {
    showSuccess,
    showError,
} from "../../shared/services/notificationService";
import OwnerProfileForm from "./components/owner/OwnerProfileForm";

// Схема валидации данных для верификации
const validationSchema = Yup.object({
    last_name: Yup.string().required("Обязательное поле"),
    first_name: Yup.string().required("Обязательное поле"),
    patronymic: Yup.string().nullable(),
    birth_date: Yup.date()
        .required("Обязательное поле")
        .max(new Date(), "Дата не может быть в будущем"),
    phone: Yup.string()
        .required("Обязательное поле")
        .matches(/^\+375\d{9}$/, "Формат: +375XXXXXXXXX"),
    apartment_number: Yup.number()
        .typeError("Номер квартиры должен быть числом")
        .integer("Должно быть целое число")
        .min(1, "Номер квартиры не может быть меньше 1")
        .max(80, "Номер квартиры не может быть больше 80")
        .required("Обязательное поле"),
});

const UsersProfiles = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const authUser = useSelector((state) => state.auth.user);
    const [ownerData, setOwnerData] = useState(null);
    const [loading, setLoading] = useState(false);

    const isUser = authUser?.role === "user";
    const isOwner = authUser?.role === "owner";
    const isAdmin = authUser?.role === "admin";
    const verificationStatus = authUser?.verification_status;

    // Загрузка данных владельца для собственников
    useEffect(() => {
        if (!authUser) return;

        // Для пользователей создаем форму или подгружаем данные из запроса на верификацию
        if (isUser) {
            setLoading(true);
            if (verificationStatus === "pending") {
                apiClient
                    .get(`/user/my-verification-request`)
                    .then((response) => {
                        // Устанавливаем значения формы
                        formik.setValues({
                            last_name: response.data.last_name || "",
                            first_name: response.data.first_name || "",
                            patronymic: response.data.patronymic || "",
                            birth_date: response.data.birth_date
                                ? new Date(response.data.birth_date)
                                : null,
                            phone: response.data.phone || "",
                            apartment_number:
                                response.data.apartment_number || "",
                        });
                    })
                    .catch((error) => {
                        showError(error);
                    });
            } else {
                formik.setValues({
                    last_name: authUser.last_name || "",
                    first_name: authUser.first_name || "",
                    patronymic: authUser.patronymic || "",
                    birth_date: authUser.birth_date
                        ? new Date(authUser.birth_date)
                        : null,
                    phone: authUser.phone || "",
                    apartment_number: authUser.apartment_number || "",
                });
            }
            setLoading(false);
        }

        // Для собственников загружаем данные владельца и собственности
        if (isOwner) {
            setLoading(true);
            apiClient
                .get(`/owner/profile`)
                .then((response) => {
                    setOwnerData(response.data);
                })
                .catch((error) => {
                    setOwnerData(null);
                    showError(error);
                })
                .finally(() => setLoading(false));
        }
    }, [authUser, verificationStatus]);

    // Форма для валидации
    const formik = useFormik({
        initialValues: {
            last_name: "",
            first_name: "",
            patronymic: "",
            birth_date: null,
            phone: "",
            apartment_number: "",
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const formattedValues = {
                    ...values,
                    birth_date: values.birth_date
                        ? values.birth_date.toISOString().split("T")[0]
                        : null,
                };

                const response = await apiClient.post(
                    "/user/verification-request",
                    formattedValues
                );

                showSuccess(response.data.message);
                dispatch(fetchCurrentUser());
            } catch (error) {
                if (error.response?.status === 422) {
                    showError("Собственник с указанными данными не найден");
                } else {
                    showError(error);
                }
            }
        },
    });

    // Удаление аккаунта пользователя
    const handleDeleteAccount = async () => {
        if (window.confirm("Вы уверены, что хотите удалить свой аккаунт?")) {
            try {
                await apiClient.delete("/user");
                dispatch(clearAuth());
                showSuccess("Ваш аккаунт успешно удален");
                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } catch (error) {
                console.error("Ошибка удаления аккаунта:", error);
                showError(error);
            }
        }
    };

    return (
        <>
            <Box
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
                    maxWidth="lg"
                    sx={{
                        pt: { xs: 14, sm: 8 },
                        pb: { xs: 8, sm: 8 },
                    }}
                >
                    {/* Заголовок */}
                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: "center",
                            mb: 6,
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                        }}
                    >
                        Профиль
                        <Typography
                            component="span"
                            variant="h2"
                            color="primary"
                            sx={{ fontWeight: "bold" }}
                        >
                            пользователя
                        </Typography>
                    </Typography>

                    {/* Общие данные для профилей пользователь или админ */}
                    {(isUser ||  isAdmin) && (
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            marginBottom={2}
                            spacing={4}
                        >
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                            >
                                Имя профиля:{" "}
                                <Box component="span" fontWeight="normal">
                                    {authUser?.name}
                                </Box>
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                            >
                                Адрес почты:{" "}
                                <Box component="span" fontWeight="normal">
                                    {authUser?.email}
                                </Box>
                            </Typography>

                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                gutterBottom
                            >
                                Статус Вашего профиля:{" "}
                                <Box component="span" fontWeight="normal">
                                    {isUser ? "Пользователь" : ""}
                                    {isOwner ? "Собственник" : ""}
                                    {isAdmin ? "Администратор" : ""}
                                </Box>
                            </Typography>
                        </Stack>
                    )}

                    {/* Статус верификации */}
                    {verificationStatus === "unverified" && (
                        <Box m={3}>
                            <Alert severity="info">
                                Вы не направляли запрос на верификацию себя как
                                собственника жилого помещения
                            </Alert>
                        </Box>
                    )}
                    {verificationStatus === "pending" && (
                        <Box m={3}>
                            <Alert severity="info">
                                Ваш запрос на верификацию ожидает подтверждения
                                администратором
                            </Alert>
                        </Box>
                    )}

                    {/* Для пользователя загружаем форму */}
                    {loading ? (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress />
                        </Box>
                    ) : isUser ? (
                        <UserProfileForm
                            formik={formik}
                            isPending={verificationStatus === "pending"}
                            onDeleteAccount={handleDeleteAccount}
                            isSubmitting={formik.isSubmitting}
                        />
                    ) : (
                        <></>
                    )}

                    {/* Для собственника выводим данные */}
                    {loading ? (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress />
                        </Box>
                    ) : isOwner ? (
                        <>
                            {isOwner && ownerData && (
                                <OwnerProfileForm
                                    ownerData={ownerData}
                                    email={authUser.email}
                                    onDeleteAccount={handleDeleteAccount}
                                />
                            )}
                        </>
                    ) : (
                        <></>
                    )}
                </Container>
            </Box>
        </>
    );
};

export default UsersProfiles;
