import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
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

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<MainPage />} />
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
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
