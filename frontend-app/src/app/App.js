import { StoreProvider } from "./providers/StoreProvider";
import { BrowserRouter } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from "date-fns/locale/ru";
import AppRouter from "./router/AppRouter";
import ScrollToTop from "./providers/ScrollProvider";
import AppTheme from "./providers/ThemeProvider";
import AdProvider from "./providers/AdContext";

function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <AppTheme>
                <BrowserRouter>
                    <AdProvider>
                        <StoreProvider>
                            <ScrollToTop />
                            <AppRouter />
                        </StoreProvider>
                    </AdProvider>
                </BrowserRouter>
            </AppTheme>
        </LocalizationProvider>
    );
}

export default App;
