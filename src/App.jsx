import { BrowserRouter, Route, Routes } from "react-router-dom"
import RegisterPage from "./pages/RegisterPage/RegisterPage"
import LoginPage from "./pages/LoginPage/LoginPage"
import ForgetPasswordPage from "./pages/ForgetPasswordPage/ForgetPasswordPage"
import ResetPasswordPage from "./pages/ForgetPasswordPage/ResetPasswordPage"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<ForgetPasswordPage />} path="/forgetPassword" />
          <Route element={<ResetPasswordPage />} path="/reset" />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
