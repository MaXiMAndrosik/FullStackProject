import { ToastContainer } from "react-toastify";
import { Outlet } from "react-router-dom";
import { alpha } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import DeviceInfo from "../../shared/hooks/DeviceInfo";
import SideMenu from "../../widgets/Menu/SideMenu";
import AppNavbar from "../../widgets/Menu/AppNavbar";
import Header from "../../widgets/Header/Header";
import Footer from "../../widgets/Footer/Footer";

const MainLayout = () => {
    return (
        <>
            <DeviceInfo />
            <ToastContainer />
            <Box sx={{ display: "flex" }}>
                <SideMenu />
                <AppNavbar />
                <Box
                    component="main"
                    sx={(theme) => ({
                        flexGrow: 1,
                        backgroundColor: theme.vars
                            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                            : alpha(theme.palette.background.default, 1),
                        overflow: "auto",
                    })}
                >
                    <Stack
                        spacing={2}
                        sx={{
                            alignItems: "center",
                            mt: { xs: 8, md: 0 },
                        }}
                    >
                        <Header />
                        <Outlet />
                        <Footer />
                    </Stack>
                </Box>
            </Box>
        </>
    );
};

export default MainLayout;
