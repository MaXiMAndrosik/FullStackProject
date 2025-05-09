import * as React from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MenuContent from "../../shared/ui/MenuContent";

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: "border-box",
    mt: 10,
    [`& .${drawerClasses.paper}`]: {
        width: drawerWidth,
        boxSizing: "border-box",
    },
});

export default function SideMenu() {
    return (
        <Drawer
            component="section"
            variant="permanent"
            sx={{
                display: { xs: "none", md: "block" },
                [`& .${drawerClasses.paper}`]: {
                    backgroundColor: "background.paper",
                },
            }}
        >
            <Stack
                direction="row"
                sx={{
                    p: 2,
                    gap: 2,
                    alignItems: "center",
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Avatar
                    sizes="small"
                    alt="ЖСПК"
                    src="/images/Logo.jpg"
                    sx={{ width: 46, height: 46 }}
                    variant="rounded"
                />
                <Box sx={{ mr: "auto" }}>
                    <Typography sx={{ fontWeight: 600 }}>
                        ЖСПК "Зенитчик-4"
                    </Typography>
                </Box>
            </Stack>
            <Divider />
            <MenuContent />
        </Drawer>
    );
}
