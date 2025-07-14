import MainLayout from "../../features/layouts/MainLayout";
// Home
import HomePage from "../../features/home";
// Advertisements
import AnnouncementPage from "../../features/announcements/AnnouncementPage";
import AnnouncementForm from "../../features/announcements/AnnouncementForm";
// Services
import HousingServicesPage from "../../features/services/HousingServicesPage";
// Appeals
import AppealsPage from "../../features/appeal/AppealPage";
// About
import AboutPage from "../../features/about/AboutPage";
// ErrorPages
import NotFoundPage from "../../widgets/ErrorPages/NotFoundPage";
import UnauthorizedPage from "../../widgets/ErrorPages/UnauthorizedPage";
import ForbiddenPage from "../../widgets/ErrorPages/ForbiddenPage";
import InDevelopmentPage from "../../widgets/ErrorPages/InDevelopmentPage";
// Auth
import SignUp from "../../features/auth/SignUp";
import SignIn from "../../features/auth/SignIn";
import VerifyNotice from "../../features/auth/components/VerifyNotice";
import ResendVerification from "../../features/auth/components/ResendVerification";
import AuthCallback from "../../features/auth/components/AuthCallback";

// Owner
import OwnerServicesPage from "../../features/users/owner/OwnerServicesPage";

// User
import UserProfile from "../../features/users/UsersProfiles";


// Admin
import AdminServicesPage from "../../features/users/admin/AdminServicesPage";
import AdminVerificationPanel from "../../features/users/admin/AdminVerificationPanel";
import AdminServicesAssignmentsPage from "../../features/users/admin/AdminServicesAssignmentsPage";
import AdminOwnersPage from "../../features/users/admin/AdminOwnersPage";
import AdminUsersPage from "../../features/users/admin/AdminUsersPage";
import AdminAppealsPage from "../../features/appeal/AdminAppealsPage";
import AdminApartmentsPage from "../../features/users/admin/AdminApartmentsPage";



import { AdminRoute, AdminOwnerUserRoute, OwnerRoute } from "./RoleRoute";

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
                element: (
                    <AdminRoute>
                        <AnnouncementForm />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/appeals",
                element: (
                    <AdminRoute>
                        <AdminAppealsPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin",
                element: (
                    <AdminRoute>
                        <InDevelopmentPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/users",
                element: (
                    <AdminRoute>
                        <AdminUsersPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/owners",
                element: (
                    <AdminRoute>
                        <AdminOwnersPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/verification",
                element: (
                    <AdminRoute>
                        <AdminVerificationPanel />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/services",
                element: (
                    <AdminRoute>
                        <AdminServicesPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/services-assignments",
                element: (
                    <AdminRoute>
                        <AdminServicesAssignmentsPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/apartments",
                element: (
                    <AdminRoute>
                        <AdminApartmentsPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/meters",
                element: (
                    <AdminRoute>
                        <InDevelopmentPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/admin/meter-readings",
                element: (
                    <AdminRoute>
                        <InDevelopmentPage />
                    </AdminRoute>
                ),
            },
            {
                path: "/user/receipts",
                element: <InDevelopmentPage />,
            },
            {
                path: "/user/history",
                element: <InDevelopmentPage />,
            },
            {
                path: "/user/meters",
                element: <InDevelopmentPage />,
            },
            {
                path: "/owner/services",
                element: (
                    <OwnerRoute>
                        <OwnerServicesPage />
                    </OwnerRoute>
                ),
            },
            {
                path: "/user/profile",
                element: (
                    <AdminOwnerUserRoute>
                        <UserProfile />
                    </AdminOwnerUserRoute>
                ),
            },
            {
                path: "/services",
                element: <HousingServicesPage />,
            },
            {
                path: "/appeals",
                element: <AppealsPage />,
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
