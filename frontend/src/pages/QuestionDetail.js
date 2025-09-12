import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API = "http://localhost:5001/api";

export default function QuestionDetail() {
    const { id } = useParams();
    const [answers, setAnswers] = useState([]);
    const [newAnswer, setNewAnswer] = useState("");

    const token = localStorage.getItem("token");
    let decodedUsername = null;
    if (token) {
        try{
            const decoded = jwtDecode(token);
            decodedUsername = decoded.username;
        } catch (err) {
            console.error("Invalid token");
        }
    }


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

    async function deleteAnswer(id) {
        if(!token) {
            alert("You must be logged in to delete an answer");
            return;
        }
        try{
            await axios.delete(`${API}/answers/${id}`, {
                headers: { Authorization: `Bearer ${token}`}
            });
            setAnswers(answers.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
            alert("Error deleting answer");
        }
    }

    return (
        <div className="d-flex flex-column align-items-center mt-3">
            <h2 className="mb-3">Answers</h2>
            {token && (
                <div className="mb-3" style={{ width:"100%", maxWidth:"90%"}}>
                    <textarea 
                    className="form-control mb-2"
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Write your answer..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            postAnswer();
                        }
                    }}
                    rows={3}
                    />
                    <br />
                    <div className="d-flex justify-content-end">
                        <button 
                            className="btn btn-primary mb-3" 
                            style={{ width:"150px", fontSize: "1rem"}}
                            onClick={postAnswer}>Post
                        </button>
                    </div>
                </div>
            )}
            <ul>
                {answers.map((a) => (
                    <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
                       <span>{a.body} - {a.username} </span> 
                       {token && a.username === decodedUsername && (
                        <button
                            className="btn btn-secondary btn-sm ms-2 mt-2"
                            onClick={() => deleteAnswer(a.id)}
                        >
                            Delete
                        </button>
                       )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

