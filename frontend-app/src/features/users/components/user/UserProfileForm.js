import React from "react";
import {
    FormControl,
    FormHelperText,
    Grid,
    Box,
    Typography,
    Button,
    CircularProgress,
    Stack,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const UserProfileForm = ({
    formik,
    isPending,
    onDeleteAccount,
    isSubmitting,
}) => {
    return (
        <>
            {/* Подсказки для пользователя */}
            {!isPending && (
                <Box
                    mt={4}
                    mb={4}
                    p={2}
                    bgcolor="background.paper"
                    borderRadius={1}
                >
                    <Typography variant="h6" gutterBottom>
                        Как заполнить форму:
                    </Typography>
                    <ul>
                        <li>
                            <Typography>
                                Используйте свои настоящие ФИО и телефон
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                Номер квартиры должен соответствовать
                                официальным данным
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                Используется полуавтоматическая верификация
                                собственников
                            </Typography>
                        </li>
                        <li>
                            <Typography>
                                Это может занять несколько дней. Вы можете
                                обратиться к Председателю правления напрямую,
                                чтобы ускорить этот процесс
                            </Typography>
                        </li>
                    </ul>
                </Box>
            )}

            {/* Форма для заполнения */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
                <Box sx={{ flex: 2 }}>
                    <form onSubmit={formik.handleSubmit}>
                        <Stack spacing={3}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <StyledTextArea
                                        fullWidth
                                        name="last_name"
                                        label="Фамилия"
                                        value={formik.values.last_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.last_name &&
                                            Boolean(formik.errors.last_name)
                                        }
                                        helperText={
                                            formik.touched.last_name &&
                                            formik.errors.last_name
                                        }
                                        required
                                        disabled={isPending}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <StyledTextArea
                                        fullWidth
                                        name="first_name"
                                        label="Имя"
                                        value={formik.values.first_name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.first_name &&
                                            Boolean(formik.errors.first_name)
                                        }
                                        helperText={
                                            formik.touched.first_name &&
                                            formik.errors.first_name
                                        }
                                        required
                                        disabled={isPending}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <StyledTextArea
                                        fullWidth
                                        name="patronymic"
                                        label="Отчество"
                                        value={formik.values.patronymic}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.patronymic &&
                                            Boolean(formik.errors.patronymic)
                                        }
                                        helperText={
                                            formik.touched.patronymic &&
                                            formik.errors.patronymic
                                        }
                                        required
                                        disabled={isPending}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <FormControl fullWidth>
                                        <DatePicker
                                            label="Дата рождения"
                                            value={formik.values.birth_date}
                                            onChange={(date) =>
                                                formik.setFieldValue(
                                                    "birth_date",
                                                    date
                                                )
                                            }
                                            slotProps={{
                                                textField: {
                                                    error:
                                                        formik.touched
                                                            .birth_date &&
                                                        Boolean(
                                                            formik.errors
                                                                .birth_date
                                                        ),
                                                    onBlur: formik.handleBlur,
                                                },
                                            }}
                                            disabled={isPending}
                                        />
                                        {formik.touched.birth_date &&
                                            formik.errors.birth_date && (
                                                <FormHelperText error>
                                                    {formik.errors.birth_date}
                                                </FormHelperText>
                                            )}
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <StyledTextArea
                                        fullWidth
                                        name="phone"
                                        label="Телефон"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.phone &&
                                            Boolean(formik.errors.phone)
                                        }
                                        helperText={
                                            formik.touched.phone &&
                                            formik.errors.phone
                                        }
                                        required
                                        disabled={isPending}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <StyledTextArea
                                        fullWidth
                                        name="apartment_number"
                                        label="Номер квартиры"
                                        value={formik.values.apartment_number}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={
                                            formik.touched.apartment_number &&
                                            Boolean(
                                                formik.errors.apartment_number
                                            )
                                        }
                                        helperText={
                                            formik.touched.apartment_number &&
                                            formik.errors.apartment_number
                                        }
                                        required
                                        disabled={isPending}
                                    />
                                </Grid>
                            </Grid>
                        </Stack>

                        {!isPending && (
                            <Box mt={3} display="flex" gap={2}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        "Запросить верификацию"
                                    )}
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={onDeleteAccount}
                                >
                                    Удалить аккаунт
                                </Button>
                            </Box>
                        )}
                    </form>
                </Box>
            </Stack>
        </>
    );
};

export default UserProfileForm;
