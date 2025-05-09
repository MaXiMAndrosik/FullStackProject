import { useRoutes } from "react-router-dom";
import { routes } from "./routes";

function AppRouter() {
    const routeElements = useRoutes(routes);
    return <>{routeElements}</>;
}

export default AppRouter;