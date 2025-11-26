// ТАБЛИЦА УСЛУГ

// Вспомогательная функция для получения стилей текста названия услуги
export const getServiceNameTextStyle = (isActive) => {
    return {
        color: !isActive ? "grey.400" : "text.primary",
        // fontStyle: !isActive ? "italic" : "normal",
    };
};

// Универсальная функция для отображения тарифа в ServicesTable
export const getServiceTariffDisplayUniversal = (service) => {
    const {
        is_active,
        current_tariff_obj,
        current_tariff_display,
        tariff_status,
    } = service;

    if (!is_active) {
        return {
            color: "grey.400",
            tooltipName: "Услуга отключена",
            tooltipTariff: "Тариф не используется",
            displayText: current_tariff_display,
            fontStyle: "italic",
        };
    }

    // Услуга активна
    if (current_tariff_obj) {
        const statusInfo = getServiceStatusInfo(
            is_active,
            tariff_status,
            current_tariff_display
        );
        return {
            color: "text.primary",
            tooltipName: statusInfo.tooltipName,
            tooltipTariff: statusInfo.tooltipTariff,
            displayText: current_tariff_display,
            fontStyle: "normal",
        };
    } else {
        return {
            color: "info.main",
            tooltipName: "Активная услуга с планируемым тарифом",
            tooltipTariff: "Тариф планируется",
            displayText: "Планируется",
            fontStyle: "italic",
        };
    }
};

// Вспомогательная функция для отображения тарифов в ServicesTable
const getServiceStatusInfo = (isActive, tariffStatus, currentTariff) => {
    if (!isActive) {
        return {
            color: "warning.main",
            tooltipName: "Услуга отключена",
            tooltipTariff: "Тариф не используется",
            text: "Услуга отключена",
            displayText: "Услуга отключена",
        };
    }

    switch (tariffStatus) {
        case "current":
            return {
                color: "success.main",
                tooltipName: "Активная услуга с действующим тарифом",
                tooltipTariff: "Действующий тариф",
                text: "Активна",
                displayText: `Активна • ${currentTariff}`,
            };
        case "future":
            return {
                color: "info.main",
                tooltipName: "Активная услуга с планируемым тарифом",
                tooltipTariff: "Тариф планируется",
                text: "Активна",
                displayText: `Активна • ${currentTariff}`,
            };
        case "expired":
            return {
                color: "grey.400",
                tooltipName: "Активная услуга с устаревшим тарифом",
                tooltipTariff: "Архивный тариф",
                text: "Активна",
                displayText: `Активна • ${currentTariff}`,
            };
        case "none":
        default:
            return {
                color: "grey.500",
                tooltipName: "Активная услуга без установленного тарифа",
                tooltipTariff: "Активная услуга без установленного тарифа",
                text: "Активна",
                displayText: "Активна • Нет тарифа",
            };
    }
};


// ТАБЛИЦА ТАРИФОВ


// Вспомогательная функция для получения стилей названия услуги в таблице тарифов
export const getTariffServiceNameStyle = (
    isServiceActive,
    isServiceDeleted
) => {
    if (isServiceDeleted) {
        return {
            color: "grey.400",
            fontStyle: "italic",
            tooltip: "Услуга удалена",
        };
    }

    return {
        ...getServiceNameTextStyle(isServiceActive),
        tooltip: !isServiceActive ? "Услуга отключена" : "Активная услуга",
    };
};

// Вспомогательная функция для получения стилей тарифа
export const getTariffRateStyle = (isServiceActive, isServiceDeleted) => {
    if (isServiceDeleted) {
        return {
            color: "grey.400",
            fontStyle: "italic",
        };
    }

    if (!isServiceActive) {
        return {
            color: "grey.400",
            fontStyle: "italic",
        };
    }

    return {
        color: "text.primary",
        fontStyle: "normal",
    };
};

// Универсальная функция для отображения статуса тарифа
export const getTariffStatusDisplay = (tariff) => {
    const { status, service_is_active, is_service_deleted } = tariff;

    if (is_service_deleted) {
        return {
            color: "grey.400",
            tooltip: "Услуга удалена, тариф устарел",
            displayText: "Архивный",
            showDot: true,
        };
    }

    if (!service_is_active) {
        return {
            color: "warning.main",
            tooltip: "Услуга отключена",
            displayText: "Отключен",
            showDot: true,
        };
    }

    switch (status) {
        case "current":
            return {
                color: "success.main",
                tooltip: "Действующий тариф",
                displayText: "Действующий",
                showDot: true,
            };
        case "future":
            return {
                color: "info.main",
                tooltip: "Тариф еще не вступил в силу",
                displayText: "Планируемый",
                showDot: true,
            };
        case "expired":
            return {
                color: "grey.400",
                tooltip: "Тариф устарел",
                displayText: "Архивный",
                showDot: true,
            };
        default:
            return {
                color: "grey.600",
                tooltip: "Неизвестный статус",
                displayText: "Неизвестно",
                showDot: true,
            };
    }
};
