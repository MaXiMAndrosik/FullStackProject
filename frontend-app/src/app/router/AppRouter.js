import { useNavigate } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";

// Глобальная переменная (не идеально, но работает)
let globalNavigate;

function AppRouter() {
    const navigate = useNavigate();
    const routeElements = useRoutes(routes);

    globalNavigate = navigate;

    return <>{routeElements}</>;
}

export default AppRouter;

// Экспортируем функцию навигации
export const navigate = (to) => {
    if (globalNavigate) {
        globalNavigate(to);
    } else {
        window.location.href = to;
    }
};
