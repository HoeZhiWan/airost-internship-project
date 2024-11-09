import { BrowserRouter, Route, Routes } from "react-router-dom"
import RegisterPage from "./pages/RegisterPage/RegisterPage"

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<RegisterPage />} path="/register" />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
