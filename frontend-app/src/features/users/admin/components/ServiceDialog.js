import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    MenuItem,
    Checkbox,
    ListItemText,
    Chip,
} from "@mui/material";
import StyledTextArea from "../../../../shared/ui/StyledTextArea";

const ServiceDialog = ({
    open,
    onClose,
    currentService,
    onSubmit,
    calculationType,
    setCalculationType,
    meterTypes = [],
}) => {
    const [selectedMeterTypes, setSelectedMeterTypes] = useState([]);

    // Инициализация выбранных типов счетчиков при изменении currentService
    useEffect(() => {
        if (currentService?.meter_types) {
            const selectedIds = currentService.meter_types.map(
                (type) => type.id
            );
            setSelectedMeterTypes(selectedIds);
        } else {
            setSelectedMeterTypes([]);
        }
    }, [currentService, open]);

    // Получаем ВСЕ типы счетчиков (включая неактивные)
    const allMeterTypes = meterTypes;

    const handleMeterTypeChange = (event) => {
        const value = event.target.value;
        setSelectedMeterTypes(value);
    };

    // Обработчик отправки формы
    const handleFormSubmit = (event) => {
        // event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Добавляем выбранные типы счетчиков
        data.meter_type_ids = selectedMeterTypes;

        // Преобразуем boolean значения
        data.is_active = data.is_active === "on";

        onSubmit(event, data);
    };

    // Получаем неактивные типы счетчиков для информации
    const inactiveMeterTypes = allMeterTypes.filter((type) => !type.is_active);
    const hasInactiveSelected = selectedMeterTypes.some((id) =>
        inactiveMeterTypes.some((inactiveType) => inactiveType.id === id)
    );

    // Функция для преобразования единиц измерения в русские названия
    const getUnitLabel = (unit) => {
        const unitLabels = {
            m3: "м³",
            gcal: "Гкал",
            kwh: "кВт·ч",
            fixed: "фикс.",
            m2: "м²",
        };
        return unitLabels[unit] || unit;
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {currentService ? "Редактирование услуги" : "Новая услуга"}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleFormSubmit} id="service-form">
                    <StyledTextArea
                        name="name"
                        label="Название"
                        defaultValue={currentService?.name || ""}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <StyledTextArea
                        name="type"
                        label="Тип услуги"
                        select
                        defaultValue={currentService?.type || "main"}
                        fullWidth
                        margin="normal"
                        required
                    >
                        <MenuItem value="main">Основная</MenuItem>
                        <MenuItem value="utility">Коммунальная</MenuItem>
                        <MenuItem value="additional">Дополнительная</MenuItem>
                        <MenuItem value="other">Прочее</MenuItem>
                    </StyledTextArea>
                    <StyledTextArea
                        name="code"
                        label="Код"
                        defaultValue={currentService?.code || ""}
                        fullWidth
                        margin="normal"
                        required
                        inputProps={{ maxLength: 20 }}
                        helperText="Максимум 20 символов"
                    />
                    <StyledTextArea
                        name="description"
                        label="Описание"
                        defaultValue={currentService?.description || ""}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    <StyledTextArea
                        name="calculation_type"
                        label="Тип расчёта"
                        select
                        SelectProps={{ native: true }}
                        defaultValue={
                            currentService?.calculation_type || "fixed"
                        }
                        fullWidth
                        margin="normal"
                        onChange={(e) => setCalculationType(e.target.value)}
                        required
                    >
                        <option value="fixed">Фиксированный</option>
                        <option value="meter">По счётчику</option>
                        <option value="area">По площади</option>
                    </StyledTextArea>

                    {calculationType === "meter" && (
                        <StyledTextArea
                            name="meter_type_ids"
                            label="Типы счетчиков"
                            select
                            SelectProps={{
                                multiple: true,
                                native: false,
                                renderValue: (selected) => (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 0.5,
                                        }}
                                    >
                                        {selected.map((value) => {
                                            const selectedType =
                                                allMeterTypes.find(
                                                    (type) => type.id === value
                                                );
                                            const unitLabel = getUnitLabel(
                                                selectedType?.unit
                                            );
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={
                                                        selectedType
                                                            ? `${selectedType.name} (${unitLabel})`
                                                            : value
                                                    }
                                                    size="small"
                                                    color={
                                                        selectedType?.is_active
                                                            ? "primary"
                                                            : "default"
                                                    }
                                                    variant="outlined"
                                                />
                                            );
                                        })}
                                    </Box>
                                ),
                            }}
                            value={selectedMeterTypes}
                            onChange={handleMeterTypeChange}
                            fullWidth
                            margin="normal"
                            required
                        >
                            {allMeterTypes.length > 0 ? (
                                allMeterTypes.map((type) => {
                                    const unitLabel = getUnitLabel(type.unit);
                                    return (
                                        <MenuItem key={type.id} value={type.id}>
                                            <Checkbox
                                                checked={
                                                    selectedMeterTypes.indexOf(
                                                        type.id
                                                    ) > -1
                                                }
                                            />
                                            <ListItemText
                                                primary={`${type.name} (${unitLabel})`}
                                            />
                                        </MenuItem>
                                    );
                                })
                            ) : (
                                <MenuItem disabled>
                                    Нет доступных типов счетчиков
                                </MenuItem>
                            )}
                        </StyledTextArea>
                    )}

                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            defaultChecked={currentService?.is_active ?? true}
                        />
                        <label htmlFor="is_active" style={{ marginLeft: 8 }}>
                            Активна
                        </label>
                    </Box>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button
                    type="submit"
                    form="service-form"
                    variant="contained"
                    disabled={
                        calculationType === "meter" &&
                        allMeterTypes.length === 0
                    }
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServiceDialog;
