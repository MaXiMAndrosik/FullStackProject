import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    MenuItem,
    FormControlLabel,
    Switch,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";
import { Close as CloseIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";

const MeterDialog = ({
    open,
    onClose,
    meter,
    onSubmit,
    meterTypes,
    apartments,
}) => {
    const parseCustomDate = (dateString) => {
        if (!dateString) return null;
        const [day, month, year] = dateString.split(".").map(Number);
        return new Date(year, month - 1, day);
    };

    const [errors, setErrors] = useState({
        apartment_id: "",
        type_id: "",
        serial_number: "",
        installation_date: "",
        next_verification_date: "",
        is_active: "",
    });

    const [formData, setFormData] = useState({
        apartment_id: "",
        type_id: "",
        serial_number: "",
        installation_date: null,
        next_verification_date: null,
        is_active: false,
    });

    // Функция валидации обязательных полей
    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "apartment_id":
                if (!/^\d+$/.test(value)) {
                    error = "Только цифровое значение";
                } else if (parseInt(value) < 1 || parseInt(value) > 80) {
                    error = "Номер должен быть от 1 до 80";
                }
                break;
            case "type_id":
            case "serial_number":
                if (!value) {
                    error = "Поле обязательно";
                }
                break;
            case "installation_date":
                if (!value) {
                    error = "Дата установки обязательна";
                } else if (new Date(value) > new Date()) {
                    error = "Дата не может быть в будущем";
                }
                break;
            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
        return error === "";
    };

    useEffect(() => {
        if (meter) {
            setFormData({
                apartment_id: meter.apartment_id,
                type_id: meter.type_id,
                serial_number: meter.serial_number,
                installation_date:
                    parseCustomDate(meter.installation_date_formatted) || null,
                next_verification_date:
                    parseCustomDate(meter.next_verification_date_formatted) ||
                    null,
                is_active: meter.is_active || false,
            });
        } else {
            setFormData({
                apartment_id: "",
                type_id: "",
                serial_number: "",
                installation_date: new Date(),
                next_verification_date: null,
                is_active: false,
            });
        }
    }, [meter, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        validateField(name, value);
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name, date) => {
        validateField(name, date);
        setFormData((prev) => ({
            ...prev,
            [name]: date,
        }));
    };

    const handleClose = () => {
        setFormData({
            apartment_id: "",
            type_id: "",
            serial_number: "",
            installation_date: parseCustomDate(new Date()),
            next_verification_date: null,
            is_active: false,
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {meter ? "Редактирование счетчика" : "Новый счетчик"}
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent>
                <form onSubmit={onSubmit} id="meter-form">
                    <Box
                        sx={{
                            mt: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        <StyledTextArea
                            select
                            label="Квартира"
                            name="apartment_id"
                            value={formData.apartment_id}
                            onChange={handleChange}
                            fullWidth
                            error={!!errors.apartment_id}
                            helperText={errors.apartment_id}
                            required
                        >
                            {apartments.map((apartment) => (
                                <MenuItem
                                    key={apartment.id}
                                    value={apartment.id}
                                >
                                    Кв. {apartment.number}
                                </MenuItem>
                            ))}
                        </StyledTextArea>

                        <StyledTextArea
                            select
                            label="Тип счетчика"
                            name="type_id"
                            value={formData.type_id}
                            onChange={handleChange}
                            fullWidth
                            error={!!errors.type_id}
                            helperText={errors.type_id}
                            required
                        >
                            {meterTypes.map((type) => (
                                <MenuItem key={type.id} value={type.id}>
                                    {type.name} ({type.unit})
                                </MenuItem>
                            ))}
                        </StyledTextArea>

                        <StyledTextArea
                            label="Серийный номер"
                            name="serial_number"
                            value={formData.serial_number}
                            onChange={handleChange}
                            fullWidth
                            error={!!errors.serial_number}
                            helperText={errors.serial_number}
                            required
                        />
                        <input
                            type="hidden"
                            name="installation_date"
                            value={
                                formData.installation_date
                                    ? format(
                                          formData.installation_date,
                                          "yyyy-MM-dd"
                                      )
                                    : ""
                            }
                        />

                        <DatePicker
                            label="Дата установки"
                            value={formData.installation_date}
                            onChange={(date) =>
                                handleDateChange("installation_date", date)
                            }
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!errors.installation_date,
                                    helperText: errors.installation_date,
                                },
                            }}
                        />

                        <input
                            type="hidden"
                            name="next_verification_date"
                            value={
                                formData.next_verification_date
                                    ? format(
                                          formData.next_verification_date,
                                          "yyyy-MM-dd"
                                      )
                                    : ""
                            }
                        />

                        <DatePicker
                            label="Дата следующей поверки"
                            value={formData.next_verification_date}
                            onChange={(date) =>
                                handleDateChange("next_verification_date", date)
                            }
                            minDate={formData.installation_date}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                },
                            }}
                        />

                        <input
                            type="hidden"
                            name="is_active"
                            value={formData.is_active ? "1" : "0"}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    name="is_active_switch"
                                    checked={formData.is_active}
                                    onChange={(e) => {
                                        setFormData(prev => ({ ...prev, is_active: e.target.checked }));
                                    }}
                                    color="primary"
                                />
                            }
                            label={formData.is_active ? "Активен" : "Неактивен"}
                        />
                    </Box>
                </form>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button variant="outlined" onClick={onClose}>
                    Отмена
                </Button>
                <Button
                    type="submit"
                    form="meter-form"
                    variant="contained"
                    disabled={Object.values(errors).some((error) => error)}
                    // onClick={handleSubmit}
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MeterDialog;
