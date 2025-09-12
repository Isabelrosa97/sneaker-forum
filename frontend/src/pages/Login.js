import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:5001/api";

export default function Login({ setUsername }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/login`, { email, password });
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);

                const decoded = jwtDecode(res.data.token);
                setUsername(decoded.username);
                navigate("/");
            }
        } catch (err) {
        console.error(err);
        alert("Login failed: Invalid email or password");
        }
    }
    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input 
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <br />
            <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <br />
            <button type="submit">Login</button>
        </form>
    ); 
}

