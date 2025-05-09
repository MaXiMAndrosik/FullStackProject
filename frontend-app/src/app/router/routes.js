import MainLayout from "../../features/layouts/MainLayout";
// Home
import HomePage from "../../features/home";
// Advertisements
import AnnouncementPage from "../../features/announcements/AnnouncementPage";
import AnnouncementForm from "../../features/announcements/AnnouncementForm";

import UserPage from "../../features/user";
// Services
import HousingServicesPage from "../../features/services/HousingServicesPage";
// Feedback
import FeedbackPage from "../../features/feedback";

// import AppealPage from "../../features/feedback";
// About
import AboutPage from "../../features/about/AboutPage";
// NotFound
import NotFoundPage from "../../widgets/ErrorPages/NotFoundPage";



export const routes = [
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "/announcements",
                element: <AnnouncementPage />,
            },
            {
                path: "/announcements/new",
                element: <AnnouncementForm />,
            },
            {
                path: "/user/receipts",
                element: <UserPage />,
            },
            {
                path: "/user/history",
                element: <UserPage />,
            },
            {
                path: "/user/meters",
                element: <UserPage />,
            },
            {
                path: "/user/settings",
                element: <UserPage />,
            },
            {
                path: "/services",
                element: <HousingServicesPage />,
            },
            {
                path: "/feedback",
                element: <FeedbackPage />,
            },
            // {
            //     path: "appeal",
            //     element: <AppealPage />,
            // },
            {
                path: "about",
                element: <AboutPage />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
];
