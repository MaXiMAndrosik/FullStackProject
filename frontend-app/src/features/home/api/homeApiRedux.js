import {
    fetchProductsStart,
    fetchProductsSuccess,
    fetchProductsFailure,
} from "../model/homeSlice";

export const fetchFeaturedProducts = () => async (dispatch) => {
    const url = "/api/featuredData.json";

    try {
        dispatch(fetchProductsStart());

        // Искусственная задержка сети
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Имитация 10% вероятности ошибки сети
        if (Math.random() < 0.1) {
            throw new Error("Соединение прервано");
        }

        const response = await fetch(url);

        // Дополнительная проверка для имитации медленного API
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Неизвестная ошибка сервера");
        }

        // Проверка Content-Type
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            throw new Error("Неверный формат ответа (ожидался JSON)");
        }

        const data = await response.json();

        // Имитация обработки на клиенте
        await new Promise((resolve) => setTimeout(resolve, 300));

        dispatch(fetchProductsSuccess(data));
    } catch (error) {
        // Логирование полной ошибки в консоль
        console.error("Fetch error:", error);

        // Отправка понятного сообщения в хранилище
        dispatch(
            fetchProductsFailure(error.message || "Не удалось загрузить товары")
        );

        // Автоматический повтор через 5 секунд
        // setTimeout(() => dispatch(fetchFeaturedProducts()), 5000);
    }
};
