import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5001/api";

export default function Answers() {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const qRes = await axios.get(`${API}/questions/${id}`);
                setQuestion(qRes.data);

                const aRes = await axios.get(`${API}/questions/${id}/answers`);
                setAnswers(aRes.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newAnswer.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to post an answer.");
            return;
        }

        try {
            const res = await axios.post(
                `${API}/questions/${id}/answers`,
                { body: newAnswer },
                { headers: { Authorization: `Bearer ${token}`}}
            );
            setAnswers([...answers, res.data]);
            setNewAnswer("");
        } catch (err) {
            console.error(err.response?.data || err.message);
            alert("Failed to post answer");
        }
    };

    return (
        <div className="container mt-4">
            {question && <h2>{question.title}</h2>}
            <h3>Answers</h3>
            {answers.length > 0 ? (
                <ul className=" list-group mb-3">
                    {answers.map((a) => (
                        <li key={a.id} className=" list-group-item mb-2">
                           <strong>{a.username}:</strong> {a.body}
                        </li>
                    ))}
                </ul>
            ) : (
                <p> No answers yet.</p>
            )}
            <form onSubmit={handleSubmit}>
                <textarea 
                    className="form-control mb-2"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="write your answer"
                />
                <button type="submit" className="btn">
                    Post 
                </button>
            </form>
        </div>
    );
}