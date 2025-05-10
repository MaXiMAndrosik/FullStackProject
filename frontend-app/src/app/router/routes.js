import MainLayout from "../../features/layouts/MainLayout";
// Home
import HomePage from "../../features/home";
// Advertisements
import AnnouncementPage from "../../features/announcements/AnnouncementPage";
import AnnouncementForm from "../../features/announcements/AnnouncementForm";
// Services
import HousingServicesPage from "../../features/services/HousingServicesPage";
// Feedback
import FeedbackPage from "../../features/feedback/FeedbackPage";
// About
import AboutPage from "../../features/about/AboutPage";
// NotFound
import NotFoundPage from "../../widgets/ErrorPages/NotFoundPage";
// Auth
import SignUp from "../../features/auth/SignUp";
import SignIn from "../../features/auth/SignIn";

import UserPage from "../../features/user";

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
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFoundPage />,
    },
    {
        path: "/register",
        element: <SignUp />,
    },
    {
        path: "/login",
        element: <SignIn />,
    },
];
