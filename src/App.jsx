import { BrowserRouter, Route, Routes } from "react-router-dom"
import RegisterPage from "./pages/RegisterPage/RegisterPage"
import LoginPage from "./pages/LoginPage/LoginPage"
import ForgetPasswordPage from "./pages/ForgetPasswordPage/ForgetPasswordPage"
import ResetPasswordPage from "./pages/ForgetPasswordPage/ResetPasswordPage"
import ConfirmationPage from "./pages/RegisterPage/ConfirmationPage"
import SetupPage from "./pages/RegisterPage/SetupPage"
import VerifyPage from "./pages/RegisterPage/VerifyPage"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<ForgetPasswordPage />} path="/forgetPassword" />
          <Route element={<ResetPasswordPage />} path="/reset" />
          <Route element={<ConfirmationPage />} path="/confirm" />
          <Route element={<SetupPage />} path="/setup" />
          <Route element={<VerifyPage />} path="/verify" />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
