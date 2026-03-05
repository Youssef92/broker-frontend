import { Routes, Route } from "react-router-dom";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Payment from "../pages/payment/Payment"; // غيرنا auth لـ payment   
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<h1>Youssef</h1>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment" element={<Payment />} />
      
    </Routes>
  );
}

export default AppRoutes;
