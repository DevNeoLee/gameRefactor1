
import { Form, Button } from "react-bootstrap"
import Radio from "./Radio";
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import data from "../pages/Quizzes/DataQuizzes";
import styles from '../pages/Quizzes/prequiz.module.css'

import Bar from "./ProgressBar";
import { useLocation} from 'react-router-dom';

import { Link } from "react-router-dom"

import HOST from "../utils/routes";
import axios from 'axios';
import QuizSolution2 from "./QuizSolution2";

import { useAppContext } from "../AppContext";

export default function Quizzes2({setQuizSubmitted, setIsQuizDone, socket, gameState}) {
    const { scope, payoff, setScope, setPayoff, session, setSession, timeTracker, setTimeTracker } = useAppContext();

    const now=60;
    const [answer, setAnswer] = useState('')
    const [answers, setAnswers] = useState([])
    const [previousAnswers, setPreviousAnswers] = useState([]);
    const [result, setResult] = useState([]);
    const [questions, setQuestions] = useState(data);

    const [finalData, setFinalData] = useState([])
    const [done, setDone] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [yourScore, setYourScore] = useState('');

    const [allCorrect, setAllCorrect] = useState(false);

    const ALPHABET = ["a", "b", "c", "d", "e", "f"]
    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const sessionDataStorage = sessionStorage.getItem('memorySession');
      
    const scrollBox = useRef();

    const updateSessionToMongoDB = async () => {
        // console.log('session in updateSessionTomongoDB from Quizzes2: ', session)
        return await axios
          .put(`${HOST}/api/session/${session._id}`,{ secondQuiz: [...result, { answers, yourScore, allCorrect, time: new Date()}], timeLastUpdated: new Date()}, {new: true})
          .then(data => {
            console.log('updated SessionTomongoDB : ')
            sessionStorage.setItem('memorySession', JSON.stringify(data.data));
            setSession(data.data);
            return data.data;
          })
          .catch(err => console.log(err))
    }

    useEffect(() => {
        if (!scope) {
            setScope(queryParams.get('scope'))
        }
    },
    [scope])


    useEffect(() => {
        if (!payoff) {
            setPayoff(queryParams.get('payoff'))
        }
    },
    [payoff])

    useEffect(() => {
        scrollBox.current.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    },
    [done])

    useEffect(() => {
        const data = mappedQuestions()
        const scoreArray = data.map(ele => ele.review.isCorrect)
        const yourScore = scoreArray.filter(ele => ele == true).length
        const allCorrect = scoreArray.every(ele => ele == true)
        setAllCorrect(allCorrect);
        setYourScore(yourScore)
        setFinalData(data)
        // console.log('answers questions mapped: ', data)
    },
    [answers])

    const handleChange = (e) => {
        setAnswer(e.target.value)
        setAnswers({ ...answers, [e.target.name]: e.target.value })
        // console.log('session in updateSessionTomongoDB from Quizzes2: ', session)
    }

    const handleSubmit = async (url) => {
        console.log('handleSubmit quiz2')
        setResult(prev => [...prev, { answers, yourScore, allCorrect}])
        const update = await updateSessionToMongoDB()
        // console.log('update: ... ', update)
        if (update) {
            setDone(true);
            setSubmitted(true);
            setPreviousAnswers(answers)
        } else {
            console.log('error: Session Not Updated!')
        }
    }

    const handleRetry = (e) => {
        e.preventDefault();
        setDone(pre => !pre)
    }

    const mappedQuestions = () => {
        let newData;
            newData = questions.questions2
        return newData.map((ele, id) => ({
            ...ele, 
            answer: {
                answer: 
                    payoff == "e" && id == 2
                    ? 
                    ele.answer
                    :
                    payoff == "f" && id == 2
                    ? 
                    ele.answerB
                    :
                    payoff == "s" && id == 2
                    ? 
                    ele.answerC
                    :
                    ele.answer
                    ,  
                isCorrect: 
                        payoff == "e" && id == 2
                        ? 
                        ele.answer == ALPHABET[answers[id + 1] - 1]
                        :
                        payoff == "f" && id == 2
                        ? 
                        ele.answerB == ALPHABET[answers[id + 1] - 1]
                        :
                        payoff == "s" && id == 2
                        ? 
                        ele.answerC == ALPHABET[answers[id + 1] - 1]
                        :
                        ele.answer == ALPHABET[answers[id + 1] - 1]

            }, 
            yourAnswer: ALPHABET[answers[id + 1] - 1], 
            review: {
                correct: ele.comment, 
                hint: ele.hint, 
                isCorrect: 
                payoff == "e" && id == 2
                ? 
                ele.answer == ALPHABET[answers[id + 1] - 1]
                :
                payoff == "f" && id == 2
                ? 
                ele.answerB == ALPHABET[answers[id + 1] - 1]
                :
                payoff == "s" && id == 2
                ? 
                ele.answerC == ALPHABET[answers[id + 1] - 1]
                :
                ele.answer == ALPHABET[answers[id + 1] - 1]
                }
        }))
    }

    const handleStart = () => {
        setIsQuizDone(true);

        socket?.emit("secondQuizDone", {room_name: gameState?.roomName, villager_id: socket.id})
    }
    
    return (
        <>
        <div className={styles.container}>
            <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
            <div className={styles.content} ref={scrollBox} style={{ maxHeight: "95vh"}}>
                <div className={styles.box}>
                    <div className={styles.title} style={{ display: done ? "none" : "block", }}>
                        <h1>Quiz2 Question </h1> 
                    </div>
                    <div style={{ display: done ? "none" : "block", }}>
                        <Form style={{ display: "flex", justifyContent: "center"}}>
                            <Form.Group>
                                {data && mappedQuestions().map((question, idx) =>(
                                <div className={styles.radio} key={question.question} >
                                    <div key={question.id} className="inputFrame" style={{ 
                                        backgroundColor: 
                                        !submitted ? "white" : submitted && question.answer.answer == ALPHABET[previousAnswers[idx + 1] - 1] ? "#b7e597" : "#ffe7aa"

                                        }}>
                                        <div style={{fontSize: "1.3rem", fontWeight: "600"}}>Question <span style={{ color: "#45838B", fontSize: "1.4rem"}}># {idx + 1}</span></div>
                                        <Form.Label htmlFor={`radio`} style={{ fontWeight: "600", fontSize: "1.3rem"}}> 
                                        {
                                            idx == 2 && scope == 'i' ?
                                            question.questionI 
                                            :
                                            question.question
                                        }
                                        </Form.Label>
                                        {
                                            idx == 1 && scope == 'i' ?
                                            question?.choicesB?.map((choice, i) => (
                                                <Radio label={choice} key={i + choice} value={i + 1} answer={answer} name={idx + 1} handleChange={handleChange} required={"required"} />
                                            ))
                                            :
                                            question?.choices?.map((choice, i) => (
                                                <Radio label={choice} key={i + choice} value={i + 1} answer={answer} name={idx + 1} handleChange={handleChange} required={"required"} />
                                            ))
                                        }
                                    </div>
                                </div>
                                ))}
                            </Form.Group>
                        </Form>
                    </div>
                    <div style={{ display: done && finalData.length > 0 ? "flex" : "none", justifyContent: "center" }}>
                        <QuizSolution2 questions={finalData} yourScore={yourScore}/>
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    {
                        done && allCorrect 
                        ?
                        <>
                        <div>
                        </div>
                        <button className={styles.buttonStart} onClick={handleStart}>
                            Start                  
                        </button>

                        </>
                        :
                        done
                        ?
                        <button className={styles.outterButton} onClick={handleRetry}>
                            Retry                        
                        </button>
                        :
                        <>
                            <div></div>
                            <button className={styles.button} onClick={handleSubmit}>
                                Submit Answers
                            </button>
                        </>
                    }
                </div>
            </div>
        </div>
        </>
    );
}
