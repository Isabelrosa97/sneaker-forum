import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Questions from "./pages/Questions";
import QuestionDetail from "./pages/QuestionDetail";
import Navbar from "./components/Navbar";
import Answers from "./Answers";

function App() {
  const [username, setUsername] = useState(null);

  useEffect (() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
      } catch {}
    }
  }, []);

  return (
    <div className="font-sans">
      <Navbar username={username} setUsername={setUsername}/>

      <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUsername={setUsername}/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/questions/:id" element={<Answers />} />
      </Routes>
      </div>
    </div>
  );
}

export default App;
