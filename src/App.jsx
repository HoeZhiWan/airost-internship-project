import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import { AuthContextProvider } from "./contexts/AuthContext";
import { ProfileProvider } from './contexts/ProfileContext';

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import RegisterPage from "./pages/RegisterPage/RegisterPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage/ForgetPasswordPage";
import ResetPasswordPage from "./pages/ForgetPasswordPage/ResetPasswordPage";
import ConfirmationPage from "./pages/RegisterPage/ConfirmationPage";
import SetupPage from "./pages/RegisterPage/SetupPage";
import VerifyPage from "./pages/RegisterPage/VerifyPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import MainPage from "./pages/MainPage/MainPage";
import DeleteUsersPage from "./pages/DebugPage/DeleteUsersPage";
import VideoCallPage from "./pages/DebugPage/VideoCallPage";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <AuthContextProvider>
          <ProfileProvider>
            <Routes>
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/forgetPassword" element={<ForgetPasswordPage />} />
              <Route path="/reset" element={<ResetPasswordPage />} />

              <Route path="/delete-uers" element={<DeleteUsersPage />} />

              {/* Public/Auth Routes */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/confirm" element={<ConfirmationPage />} />
                <Route path="/setup-profile" element={<SetupPage />} />
              </Route>

              {/* Protected Routes (requires full auth) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/video-call" element={<VideoCallPage />} />
                <Route path="/video-call/:callId" element={<VideoCallPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ProfileProvider>
        </AuthContextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
