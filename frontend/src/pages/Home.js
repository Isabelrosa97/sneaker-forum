import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:5001/api";

export default function Home() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await axios.get(`${API}/categories`);
                setCategories(res.data);
            } catch (err) {
                console.error(err);
            }
        }
        fetchCategories();
    }, []);

    async function handleCategoryClick(category) {
        setSelectedCategory(category);
        try {
            const res = await axios.get(`${API}/questions`);
            const filtered = res.data.filter(q => Number(q.category_id) === Number(category.id));

            filtered.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
            setQuestions(filtered);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="d-flex mt-4">
            <aside className="flex-shrink-0 w-64 me-4 bg-light p-3">
                <h5 className="text-center">Categories</h5>
                <ul className="list-group">
                    {categories.map(cat => (
                        <li
                            key={cat.id}
                            className={`list-group-item ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleCategoryClick(cat)}
                        >
                            {cat.name}
                        </li>
                    ))}
                 </ul>
            </aside>
                <main className="flex-grow-1">
                    {!selectedCategory && <p>Select a Category to view its questions</p>}
                    {selectedCategory && (
                        <>
                        <h5 className="text-center">{selectedCategory.name} Questions</h5>
                        {questions.length === 0 && <p>No questions yet.</p>}
                        <ul className="list-group">
                            {questions.map(q => (
                                <li key={q.id} className="list-group-item">
                                    <Link to={`/questions/${q.id}`} className="text-decoration-none">
                                        {q.title}
                                    </Link>
                                    <span className="ms-2 text-muted">- {q.username}</span>
                                </li>
                            ))}
                        </ul>                        
                        </>
                    )}
                </main>
        </div>
    );
}