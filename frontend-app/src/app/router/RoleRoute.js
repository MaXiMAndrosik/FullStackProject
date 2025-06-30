import ProtectedRoute from "./ProtectedRoute";

export const AdminRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>
);

export const OwnerRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={["owner"]}>{children}</ProtectedRoute>
);

export const AdminOrOwnerRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={["admin", "owner"]}>
        {children}
    </ProtectedRoute>
);

export const AdminOwnerUserRoute = ({ children }) => (
    <ProtectedRoute allowedRoles={["admin", "owner", "user"]}>
        {children}
    </ProtectedRoute>
);
