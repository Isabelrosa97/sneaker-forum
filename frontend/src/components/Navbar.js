import { Link, useNavigate } from "react-router-dom";


export default function Navbar({ username, setUsername }) {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("token");
        setUsername(null);
        navigate("/login");
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white custom-border">
            <div className="container-fluid d-flex justify-content-between align-items-center">

                <div className="d-flex flex-grow-1 align-items-center">
                    <Link to="/questions" className="btn btn-outline-dark btn-sm me-3">
                    Questions
                    </Link>
                </div>

                <Link to="/" className="navbar-brand mx-auto text-center title-font fs-4">
                The Sneaker Block
                </Link>
                <div className="d-flex flex-grow-1 justify-content-end">
                    {username ? (
                        <>
                        <span className="navbar-text me-3">Welcome, {username}</span>
                        <button
                        onClick={handleLogout}
                        className="btn btn-outline-dark btn-sm"
                        >
                        Logout
                        </button>
                        </>
                    ) : (
                        <>
                        <Link to="/login" className="btn btn-outline-dark btn-sm me-2">
                        Login
                        </Link>
                        <Link to="/register" className="btn btn-outline-dark btn-sm">
                        Register
                        </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}