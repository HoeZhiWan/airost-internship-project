import { BrowserRouter, Route, Routes } from "react-router-dom"
import RegisterPage from "./pages/RegisterPage/RegisterPage"
import LoginPage from "./pages/LoginPage/LoginPage"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<RegisterPage />} path="/register" />
          <Route element={<LoginPage />} path="/login" />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
