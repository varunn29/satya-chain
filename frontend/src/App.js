import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StarField from "./components/StarField";
import GlowOrbs from "./components/GlowOrbs";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import University from "./pages/University";
import Student from "./pages/Student";
import Verify from "./pages/Verify";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col relative">
        <GlowOrbs />
        <StarField />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/university" element={<University />} />
              <Route path="/student" element={<Student />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/verify/:certId" element={<Verify />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}