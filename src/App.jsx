import { BrowserRouter, Route, Routes } from "react-router-dom"
import RegisterPage from "./pages/RegisterPage/RegisterPage"
import LoginPage from "./pages/LoginPage/LoginPage"
import ForgetPasswordPage from "./pages/ForgetPasswordPage/ForgetPasswordPage"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<ForgetPasswordPage />} path="/forgetPassword" />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
