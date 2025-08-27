import { Form, Button, Alert} from "react-bootstrap"
import Radio from "../../components/Radio"
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import dataAdviceSurvey from "./DataAdviceSurvey";
import styles from './adviceSurvey.module.css'
import Bar from '../../components/ProgressBar';
import HOST from "../../utils/routes";
import axios from 'axios';
import { useAppContext } from '../../AppContext';

export default function AdviceSurvey() {
    const { session, setSession } = useAppContext();
    const now = 92;
    const [answer, setAnswer] = useState('')
    const [answers, setAnswers] = useState([{id: '1', answer: ""}, {id: '2', answer: ""}])
    const [errors, setErrors] = useState({});
    const [done, setDone] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const generation = queryParams.get('gen');
    const scrollBox = useRef();

    // Validate generation parameter
    useEffect(() => {
        if (!generation || (generation !== 1 && ![2, 3, 4].includes(generation))) {
            setError('Invalid generation parameter');
            return;
        }
    }, [generation]);

    const updateSessionToMongoDB = async () => {
        try {
            setIsLoading(true);
            const response = await axios.put(
                `${HOST}/api/session/${session?._id}`,
                {
                    gameCompleted: true,
                    memorySurvey: answers,
                    timeLastUpdated: new Date()
                },
                { new: true }
            );
            // console.log('memory survey session saved: ', response.data);
            sessionStorage.setItem('memorySession', JSON.stringify(response.data));
            return response.data;
        } catch (err) {
            console.error("memory survey save error: ", err);
            setError('Failed to save survey responses. Please try again.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    const scrollToTop = () => {
        scrollBox.current?.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }

    useEffect(() => {
        if (!done) {
            scrollToTop();
        }
    }, [done]);

    const handleChange = (e) => {
        setAnswer(e.target.value);
        setAnswers(answers.map(answer => 
            answer.id === e.target.name 
                ? {...answer, answer: e.target.value} 
                : answer
        ));
        if (errors[e.target.name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[e.target.name];
                return newErrors;
            });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        const newErrors = {};
        answers.forEach(answer => {
            if (!answer.answer) {
                newErrors[answer.id] = 'Answer is required';
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            scrollToTop();
            setDone(false);
            return;
        }

        try {
            await updateSessionToMongoDB();
            setSession(prev => ({...prev, gameCompleted: true}));
            setSubmitted(true);
            navigate("/goodbye");
        } catch (err) {
            // Error is already handled in updateSessionToMongoDB
            console.error('Failed to submit survey:', err);
        }
    }
    
    // Determine which data to use based on generation from URL parameter
    const data = dataAdviceSurvey[0]
    
    // if (error) {
    //     return (
    //         <div className={styles.container}>
    //             <Alert variant="danger">
    //                 {error}
    //             </Alert>
    //         </div>
    //     );
    // }

    return (
        <div className={styles.container}>
            <div className={styles.breadcrumbContainer}>
                <Bar now={now}/>
            </div>
            <Form style={{ display: "flex", justifyContent: "center"}} onSubmit={handleSubmit}>
                <div className={styles.content} ref={scrollBox}>
                    <div className={styles.box}>
                        <div className={styles.title} style={{ display: done ? "none" : "block" }}>     
                            {(Object.keys(errors).length > 0) && 
                                <Alert variant="danger">All Questions are Required to Answer!</Alert>
                            }
                            <h1>{dataAdviceSurvey.title}</h1> 
                            <div style={{ 
                                marginTop: "20px", 
                                marginBottom: "30px", 
                                padding: "15px 25px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "8px",
                                fontSize: "1.1rem",
                                lineHeight: "1.6",
                                color: "#333"
                            }}>
                                {generation === '1' ? (
                                    <>
                                        <p style={{ marginBottom: "10px" }}>
                                            A new group of participants will soon enter the same setting and take on the role of villagers — just like you did. Think of them as future villagers who share much in common with you.                                       
                                        </p>
                                        <p style={{ marginBottom: "10px" }}>
                                            Before these future villagers begin, we invite you to share any wisdom, advice, or lessons that you believe could help them along the way.                                        
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ marginBottom: "10px" }}>
                                            We'd like to ask you a few questions about what you remember from the exercise.
                                        </p>
                                        <p>
                                            As you answer, think back to (1) what was passed down by the previous cohort of villagers, (2) what you learned through conversations with others in your current group, and (3) your own firsthand experience.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div style={{ display: done ? "none" : "block" }}>
                            {dataAdviceSurvey && dataAdviceSurvey.questions.map((question, idx) => (
                                <div className={styles.radio} key={question.question}>
                                    <Form.Group>
                                        <div 
                                            key={question.id} 
                                            className="inputFrame" 
                                            style={{ borderColor: errors[idx+1] ? "#a6182d" : null}}
                                        >
                                            <div style={{fontSize: "1.3rem", fontWeight: "600"}}>
                                                Question <span style={{ color: "#45838B", fontSize: "1.4rem"}}># {idx + 1}</span>
                                            </div>
                                            {errors[idx + 1] && 
                                                <Alert variant="danger">{errors[idx + 1]}</Alert>
                                            }
                                        
                                            <Form.Label 
                                                htmlFor={`radio`} 
                                                style={{ fontWeight: "600", fontSize: "1.3rem"}}
                                            > 
                                                {question.question}
                                            </Form.Label>
                                            <div>(Max: 100 words)</div>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                name={question.id}
                                                value={answers[idx].answer}
                                                onChange={handleChange}
                                                maxLength={100}
                                                style={{ resize: "none", fontSize: "1.2rem", marginTop: "10px"}}    
                                            />

                                        </div>
                                    </Form.Group>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <div></div>
                        <Button 
                            className={styles.button} 
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Submitting...' : 'Submit Your Advice'}
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    );
}
