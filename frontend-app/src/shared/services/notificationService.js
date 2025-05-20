let notificationHandler = null;

export const setNotificationHandler = (handler) => {
    notificationHandler = handler;
};

const errorMessages = {
    // Стандартные HTTP ошибки
    400: "Неверный запрос",
    401: "Требуется авторизация",
    403: "Доступ запрещён",
    404: "Ресурс не найден",
    419: "Сессия устарела",
    422: "Ошибка валидации данных",
    429: "Слишком много запросов",
    500: "Ошибка сервера",
    503: "Сервис недоступен",

    // Специфичные ошибки API
    ECONNABORTED: "Таймаут соединения",
    NETWORK_ERROR: "Ошибка сети",
    default: "Произошла ошибка",
};

const getErrorMessage = (error) => {
    // Если уже русский текст - возвращаем как есть
    if (typeof error === "string" && !error.match(/[a-z]/i)) {
        return error;
    }

    // Извлекаем сообщение из разных форматов ошибок
    let message = "";

    if (error?.response?.data?.message) {
        message = error.response.data.message;
    } else if (error?.message) {
        message = error.message;
    } else if (typeof error === "string") {
        message = error;
    }

    // Проверяем, не английский ли текст
    const isEnglish = message.match(/[a-z]/i);

    // Для стандартных статусов возвращаем русский текст
    if (error?.response?.status && isEnglish) {
        return errorMessages[error.response.status] || errorMessages.default;
    }

    // Для известных кодов ошибок
    if (error?.code && errorMessages[error.code]) {
        return errorMessages[error.code];
    }

    // Возвращаем оригинальное сообщение, если оно не английское
    return isEnglish ? errorMessages.default : message;
};

export const showNotification = (type, message, duration = 3000) => {
    const finalMessage = getErrorMessage(message);

    if (notificationHandler) {
        notificationHandler({
            type,
            message: finalMessage,
            duration,
        });
    }
};

export const showSuccess = (message, duration) =>
    showNotification("success", message, duration);

export const showError = (error, duration) =>
    showNotification("error", error, duration);

export const showWarning = (warning, duration) =>
    showNotification("warning", warning, duration);
