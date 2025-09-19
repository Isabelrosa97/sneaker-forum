import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:5001/api";

export default function Questions() {
    const [questions, setQuestions] = useState([]);
    const [newQ, setNewQ] = useState("");
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");

    const [token, setToken] = useState(localStorage.getItem("token"));
    const decodedUsername = token ? jwtDecode(token).username : null;

    useEffect(() => {
        async function fetchData() {
            try {
                const [qRes, cRes] = await Promise.all([
                    axios.get(`${API}/questions`),
                    axios.get(`${API}/categories`)
                ]);
                setQuestions(qRes.data);
                setCategories(cRes.data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchData();
    }, []);

    async function postQuestion() {
        const token = localStorage.getItem("token");
        console.log("Token in localStorage:", token);
        if (!token) {
            alert("You must be logged in to post a question");
            return;
        }

        if(!newQ.trim()) {
            alert("Please type a question");
            return;
        }

        if (!categoryId) {
            alert("Please select a category");
            return;
        }
        try{
             const res = await axios.post(
            `${API}/questions`,
            { title: newQ, body: "Details coming soon...", category_id: categoryId},
            { headers: { Authorization: `Bearer ${token}`}}
            );
            setQuestions([...questions, res.data]);
            setNewQ("");
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert("Error posting question.");
        }
    };
    async function deleteQuestion(id) {
        if (!token) {
            alert("You must be logged in to delete a question");
            return;
        }
        try {
            await axios.delete(`${API}/questions/${id}`, {
                headers: { Authorization: `Bearer ${token}`}
            });
            setQuestions(questions.filter(q => q.id !== id));
        } catch (err) {
            console.error(err);
            alert("Error deleting question.");
        }
    }

    return (
        <div className="text-center">
            <h2 style={{marginTop: '2rem'}}>Questions</h2>
            {token && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        postQuestion();
                    }}
                    className="d-flex justify-content-center gap-2"
                >
                    <select
                        className="form-select w-50"
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                    >
                        <option value="">Select a category...</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <input 
                    value={newQ}
                    onChange={(e) => setNewQ(e.target.value)}
                    placeholder="Ask a sneaker question..."
                    className="form-control w-50"
                    />
                    <button type="submit" className="btn btn-secondary">Post</button>
                </form>    
            )}
            <ul className="list-group mt-3">
                {questions.map((q) => (
                    <li key={q.id} className="list-group-item d-flex justify-content-center">
                        <span>
                            <Link to={`/questions/${q.id}`} className="flex-grow-1 text-decoration-none">
                            {q.title} - {q.username}
                            </Link>
                        </span>
                        {token && q.username === decodedUsername && (
                            <button className="btn btn-secondary btn-sm ms-2" onClick={() => deleteQuestion(q.id)}>
                                Delete
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}