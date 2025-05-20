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
// ErrorPages
import NotFoundPage from "../../widgets/ErrorPages/NotFoundPage";
import UnauthorizedPage from "../../widgets/ErrorPages/UnauthorizedPage";
import ForbiddenPage from "../../widgets/ErrorPages/ForbiddenPage";
// Auth
import SignUp from "../../features/auth/SignUp";
import SignIn from "../../features/auth/SignIn";
import VerifyNotice from "../../features/auth/components/VerifyNotice";
import ResendVerification from "../../features/auth/components/ResendVerification";
import AuthCallback from "../../features/auth/components/AuthCallback";

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
                path: "/verify-notice",
                element: <VerifyNotice />,
            },
            {
                path: "/auth-callback",
                element: <AuthCallback />,
            },
            {
                path: "/resend-verification",
                element: <ResendVerification />,
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
            {
                path: "about",
                element: <AboutPage />,
            },
            {
                path: "/unauthorized",
                element: <UnauthorizedPage />,
            },
            {
                path: "/forbidden",
                element: <ForbiddenPage />,
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
