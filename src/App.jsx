import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerAnalytics from './pages/ManagerAnalytics';
import ActivitySubmission from './pages/ActivitySubmission';
import ManagerApprovals from './pages/ManagerApprovals';
import Leaderboard from './pages/Leaderboard';
import Challenges from './pages/Challenges';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import ManagerChallenges from './pages/ManagerChallenges';

// Loading spinner component
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
}

// Protected route wrapper
function ProtectedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} replace />;
    }

    return children;
}

// Public route wrapper (redirects if authenticated)
function PublicRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (isAuthenticated) {
        return <Navigate to={user?.role === 'manager' ? '/manager' : '/dashboard'} replace />;
    }

    return children;
}

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                path="/signup"
                element={
                    <PublicRoute>
                        <SignUp />
                    </PublicRoute>
                }
            />

            {/* Protected Routes with Layout */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                {/* Default redirect */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Employee Routes */}
                <Route
                    path="dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['employee']}>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="submit"
                    element={
                        <ProtectedRoute allowedRoles={['employee']}>
                            <ActivitySubmission />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="badges"
                    element={
                        <ProtectedRoute allowedRoles={['employee']}>
                            <Badges />
                        </ProtectedRoute>
                    }
                />

                {/* Manager Routes */}
                <Route
                    path="manager"
                    element={
                        <ProtectedRoute allowedRoles={['manager']}>
                            <ManagerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/approvals"
                    element={
                        <ProtectedRoute allowedRoles={['manager']}>
                            <ManagerApprovals />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/team"
                    element={
                        <ProtectedRoute allowedRoles={['manager']}>
                            <ManagerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/analytics"
                    element={
                        <ProtectedRoute allowedRoles={['manager']}>
                            <ManagerAnalytics />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="manager/challenges"
                    element={
                        <ProtectedRoute allowedRoles={['manager']}>
                            <ManagerChallenges />
                        </ProtectedRoute>
                    }
                />

                {/* Shared Routes */}
                <Route
                    path="leaderboard"
                    element={
                        <ProtectedRoute>
                            <Leaderboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="challenges"
                    element={
                        <ProtectedRoute>
                            <Challenges />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
