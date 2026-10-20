import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactElement;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const location = useLocation();

    if (!token || !userStr) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    try {
        const user = JSON.parse(userStr);
        const userRole = user.role || (user.roles && user.roles[0]) || 'Student';

        if (allowedRoles && allowedRoles.length > 0) {
            const hasRole = allowedRoles.includes(userRole);
            if (!hasRole) {
                // Redirect user to their own portal if attempting unauthorized route
                if (userRole === 'Super Admin' || userRole === 'Office Admin') {
                    return <Navigate to="/admin" replace />;
                } else if (userRole === 'Professor') {
                    return <Navigate to="/professor" replace />;
                } else {
                    return <Navigate to="/student" replace />;
                }
            }
        }
    } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
