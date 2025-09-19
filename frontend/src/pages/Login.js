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
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ minWidth: "300px", maxWidth: "400px", width:"100%"}}>
                <h2 className="text-center mb-4">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input 
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input 
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary w-100">Login</button>
                </form>
            </div>
        </div>
    ); 
}

