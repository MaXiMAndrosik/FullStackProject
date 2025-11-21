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
    FormHelperText,
    Alert,
    Typography,
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
    const [isCalculationTypeChanged, setIsCalculationTypeChanged] =
        useState(false);

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

        // Сбрасываем флаг изменения типа расчета при открытии диалога
        setIsCalculationTypeChanged(false);
    }, [currentService, open]);

    const handleMeterTypeChange = (event) => {
        const value = event.target.value;
        setSelectedMeterTypes(value);
    };

    const handleCalculationTypeChange = (e) => {
        const newCalculationType = e.target.value;
        setCalculationType(newCalculationType);

        // Устанавливаем флаг, если тип расчета изменился
        if (
            currentService &&
            newCalculationType !== currentService.calculation_type
        ) {
            setIsCalculationTypeChanged(true);
        } else {
            setIsCalculationTypeChanged(false);
        }
    };

    // Обработчик отправки формы
    const handleFormSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        // Добавляем выбранные типы счетчиков для услуг по счетчику
        if (calculationType === "meter") {
            data.meter_type_ids = selectedMeterTypes;
        } else {
            // Если тип расчета не "по счетчику", очищаем связи
            data.meter_type_ids = [];
        }

        // Преобразуем boolean значения
        data.is_active = data.is_active === "on";

        onSubmit(event, data);
    };

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

    // Определяем, нужно ли показывать выбор счетчиков
    const shouldShowMeterTypes = calculationType === "meter";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {currentService ? "Редактирование услуги" : "Новая услуга"}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleFormSubmit} id="service-form">
                    {currentService ? (
                        // Режим редактирования - только название и код заблокированы
                        <>
                            <Box sx={{ mt: 2, mb: 1 }}>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    Название
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {currentService.name}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2, mb: 1 }}>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    Код услуги
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 0.5 }}>
                                    {currentService.code}
                                </Typography>
                            </Box>

                            {/* Скрытые поля для отправки данных */}
                            <input
                                type="hidden"
                                name="name"
                                value={currentService.name}
                            />
                            <input
                                type="hidden"
                                name="code"
                                value={currentService.code}
                            />
                        </>
                    ) : (
                        // Режим создания - все поля редактируемые
                        <>
                            <StyledTextArea
                                name="name"
                                label="Название"
                                defaultValue=""
                                fullWidth
                                margin="normal"
                                required
                            />

                            <StyledTextArea
                                name="code"
                                label="Код услуги"
                                defaultValue=""
                                fullWidth
                                margin="normal"
                                required
                                inputProps={{ maxLength: 30 }}
                                helperText="Уникальный код услуги (макс. 30 символов)"
                            />
                        </>
                    )}

                    {/* Тип расчета - ВСЕГДА редактируемый */}
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
                        onChange={handleCalculationTypeChange}
                        required
                    >
                        <option value="fixed">Фиксированный</option>
                        <option value="meter">По счётчику</option>
                        <option value="area">По площади</option>
                    </StyledTextArea>

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
                        name="description"
                        label="Описание"
                        defaultValue={currentService?.description || ""}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                    />

                    {shouldShowMeterTypes && (
                        <Box sx={{ mt: 2 }}>
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
                                                    meterTypes.find(
                                                        (type) =>
                                                            type.id === value
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
                                                        color="primary"
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
                                required={calculationType === "meter"}
                            >
                                {meterTypes.length > 0 ? (
                                    meterTypes.map((type) => {
                                        const unitLabel = getUnitLabel(
                                            type.unit
                                        );
                                        return (
                                            <MenuItem
                                                key={type.id}
                                                value={type.id}
                                            >
                                                <Checkbox
                                                    checked={
                                                        selectedMeterTypes.indexOf(
                                                            type.id
                                                        ) > -1
                                                    }
                                                />
                                                <ListItemText
                                                    primary={`${type.name} (${unitLabel})`}
                                                    secondary={type.description}
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
                            <FormHelperText>
                                {currentService
                                    ? "Выберите типы счетчиков для этой услуги. Изменения применятся ко всем связанным данным."
                                    : "Выберите типы счетчиков для этой услуги."}
                            </FormHelperText>
                        </Box>
                    )}

                    {/* Предупреждение при изменении типа расчета */}
                    {isCalculationTypeChanged && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                <strong>Изменение типа расчета</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {calculationType === "meter"
                                    ? "Вы изменили тип расчета на 'По счетчику'. Пожалуйста, выберите типы счетчиков для этой услуги."
                                    : "Вы изменили тип расчета. Связи со счетчиками будут удалены."}
                            </Typography>
                        </Alert>
                    )}

                    {/* Предупреждение если не выбраны счетчики для услуги по счетчику */}
                    {calculationType === "meter" &&
                        selectedMeterTypes.length === 0 && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    Для услуг по счетчику необходимо выбрать
                                    хотя бы один тип счетчика.
                                </Typography>
                            </Alert>
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
                        selectedMeterTypes.length === 0
                    }
                >
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ServiceDialog;
