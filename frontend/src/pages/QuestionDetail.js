import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5001/api";

export default function QuestionDetail() {
    const { id } = useParams();
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchAnswers = async () => {
            try {
                const res = await axios.get(`${API}/questions/${id}/answers`);
                setAnswers(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAnswers();
    }, [id]);

    async function postAnswer() {
        try{
        await axios.post(
            `${API}/questions/${id}/answers`,
            { body: newAnswer },
            { headers: { Authorization: `Bearer ${token}`} }
        );
        setNewAnswer("");

        const res = await axios.get(`${API}/questions/${id}/answers`);
        setAnswers(res.data);
        } catch (err) {
        console.error(err);
        }
    }
    return (
        <div>
            <h2>Answers</h2>
            {token && (
                <div className="mt-3">
                    <textarea 
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Write your answer..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            postAnswer();
                        }
                    }}
                    />
                    <br />
                    <button onClick={postAnswer}>Post Answer</button>
                </div>
            )}
            <ul>
                {answers.map((a) => (
                    <li key={a.id}>
                        {a.body} - {a.username}
                    </li>
                ))}
            </ul>
        </div>
    );
}

