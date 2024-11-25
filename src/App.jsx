import { BrowserRouter, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

import RegisterPage from "./pages/RegisterPage/RegisterPage"
import LoginPage from "./pages/LoginPage/LoginPage"
import ForgetPasswordPage from "./pages/ForgetPasswordPage/ForgetPasswordPage"
import ResetPasswordPage from "./pages/ForgetPasswordPage/ResetPasswordPage"
import ConfirmationPage from "./pages/RegisterPage/ConfirmationPage"
import SetupPage from "./pages/RegisterPage/SetupPage"
import VerifyPage from "./pages/RegisterPage/VerifyPage"
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import MainPage from "./pages/MainPage/MainPage"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/forgetPassword" element={<ForgetPasswordPage />} />
          <Route path="/reset" element={<ResetPasswordPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route index element={<MainPage />} />

          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/confirm" element={<ConfirmationPage />} />
            <Route path="/setup-profile" element={<SetupPage />} />
          </Route>

          {/* Auth Required Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
