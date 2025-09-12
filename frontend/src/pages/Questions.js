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
    const token = localStorage.getItem("token");

    let decodedUsername = null;
    if (token) {
        try{
            decodedUsername = jwtDecode(token).username;
        } catch (err) {
            console.error("Invalid token:", err);
        }
    }

    useEffect(() => {
        let ignore = false;

        async function fetchData() {
            try {
                const resQuestions = await axios.get(`${API}/questions`);
                if (!ignore) setQuestions(resQuestions.data);

                const resCategories = await axios.get(`${API}/categories`);
                if (!ignore) setCategories(resCategories.data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchData();
        return () => { ignore = true; };
    }, []);

    async function postQuestion() {
        const token = localStorage.getItem("token");
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
            await axios.post(
            `${API}/questions`,
            { title: newQ, body: "Details coming soon...", category_id: categoryId},
            { headers: { Authorization: `Bearer ${token}`}}
            );

            setNewQ("");

            const res = await axios.get(`${API}/questions`);
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
            alert("Error posting question.");
        }
    }
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
            <h2>Questions</h2>
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
                    <button type="submit" className="btn btn-primary">Post</button>
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