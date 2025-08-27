
import { Form } from "react-bootstrap"
import Radio from "../../components/Radio"
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import data from "./DataQuizzes";
import styles from './prequiz.module.css'
import Bar from '../../components/ProgressBar';
import { useLocation} from 'react-router-dom';
import { Link } from "react-router-dom"

import HOST from "../../utils/routes";
import axios from 'axios';
import QuizSolution from "../../components/QuizSolution";

import { useAppContext } from '../../AppContext';

export default function Quizzes() {
    const now=9;
    const [answer, setAnswer] = useState('')
    const [answers, setAnswers] = useState([])
    const [previousAnswers, setPreviousAnswers] = useState([]);
    const [result, setResult] = useState([]);
    const [beginTime, setBeginTime] = useState(null);
    const [questions] = useState(data);

    const [finalData, setFinalData] = useState([])
    const [done, setDone] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [yourScore, setYourScore] = useState('');

    const [allCorrect, setAllCorrect] = useState(false);

    const ALPHABET = ["a", "b", "c", "d", "e", "f"]
    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
      
    const scrollBox = useRef();

    const { generation, variation, ktf, setGeneration, setVariation, nm, session, setSession, timeTracker, setTimeTracker } = useAppContext();

    const updateSessionToMongoDB = async () => {
        return await axios
        .put(`${HOST}/api/session/${session?._id}`, { timeTracker: {...timeTracker, quizzes: {beginTime: beginTime, endTime: new Date(), type: "clickButton"}}, preQuiz: [...result, { answers, yourScore, allCorrect, time: new Date()}], timeLastUpdated: new Date()}, {new: true})
        .then(data => {
        sessionStorage.setItem('memorySession', JSON.stringify(data.data));
        setSession(data.data);
        console.log('updatedSession from Quizzes:  by calling session API')
        return data.data
        })
        .catch(err => console.log(err))
    }

    useEffect(() => {
        scrollBox.current.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    },
    [done])

    useEffect(() => {
        const data = mapData()
        const scoreArray = data.map(ele => ele.review.isCorrect)
        const yourScore = scoreArray.filter(ele => ele === true).length
        const allCorrect = scoreArray.every(ele => ele === true)
        setAllCorrect(allCorrect);
        setYourScore(yourScore)
        setFinalData(data)
        console.log('varable quiz: ', generation, variation, ktf)
    },
    [answers])

    const updateSessionUnmount = async (beginTime) => {
        await axios
        .put(`${HOST}/api/session/${session?._id}`, { timeTracker: {...timeTracker, quizzes: {...timeTracker.quizzes, beginTime: beginTime, type: "closeWindow"}}, preQuiz: [...result, { answers, yourScore, allCorrect, time: new Date()}], timeLastUpdated: new Date()}, {new: true})
        .then(data => {
            // sessionStorage.setItem('memorySession', JSON.stringify(data.data));
            console.log('updatedSession from Quizzes updateSessionWelcome: ')
            return data.data
        })
        .catch(err => console.log(err))
    }
    
      useEffect(() => {
        const beginTime = new Date();
        setBeginTime(beginTime)
        window.addEventListener('beforeunload', () => updateSessionUnmount( beginTime));
    
        return (
            () => {
                window.removeEventListener('beforeunload', updateSessionUnmount);  
            }
        )
      }, [])

    const handleChange = (e) => {
        setAnswer(e.target.value)
        setAnswers({ ...answers, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (url) => {
        setResult(prev => [...prev, { answers, yourScore, allCorrect}])
        const update = await updateSessionToMongoDB()
        if (update) {
            setSubmitted(true);
            setPreviousAnswers(answers)
            setDone(pre => !pre)
        } else {
            console.log('error: Session Not Updated!')
        }
    }

    const handleRetry = (e) => {
        e.preventDefault();
        setDone(pre => !pre)
    }

    const mapData = () => {
        let newData = [...questions.questions];
        return newData.map((ele, id) => ({
            ...ele, 
            answer: {answer: ele.answer,  isCorrect: ele.answer == ALPHABET[answers[id + 1] - 1] },
            yourAnswer: ALPHABET[answers[id + 1] - 1], 
            review: {correct: ele.comment, hint: ele.hint, isCorrect: ele.answer == ALPHABET[answers[id + 1] - 1]}}))
    }
    
    return (
        <>
        <div className={styles.container}>
        <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
            <div className={styles.content} ref={scrollBox}>
                <div className={styles.box}>
                    <div className={styles.title} style={{ display: done ? "none" : "block", }}>
                        <h1>Quiz Questions</h1> 
                    </div>
                    <div style={{ display: done ? "none" : "block", }}>
                        <Form style={{ display: "flex", justifyContent: "center"}}>
                            <Form.Group>
                                {data && data.questions.map((question, idx) =>(
                                <div className={styles.radio} key={question.question}>
                                    <div key={question.id} className="inputFrame" style={{ backgroundColor: !submitted ? "white" : submitted && question.answer == ALPHABET[previousAnswers[idx + 1] - 1] ? "#b7e597" : "#ffe7aa"}}>
                                        <div style={{fontSize: "1.3rem", fontWeight: "600", marginBottom: "8px"}}>Question <span style={{ color: "#0000c4", fontSize: "1.4rem"}}># {idx + 1}</span></div>
                                        <div style={{ fontWeight: "600", fontSize: "1.3rem"}}> {question.question}</div>
                                        {
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
                    <div style={{ display: done ? "flex" : "none", justifyContent: "center" }}>
                        <QuizSolution questions={finalData} yourScore={yourScore}/>
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    {
                        done && allCorrect 
                        ?
                        <>
                        <button style={{ visibility: "hidden"}}>
                            placeholder
                        </button>
                        <Link to={`/game/?gen=${generation}&var=${variation}&ktf=${ktf}&nm=${nm}`}>
                            <button className={styles.buttonStart}>
                                Start                  
                            </button>
                        </Link>
                        </>
                        :
                        done
                        ?
                        <button className={styles.outterButton} onClick={handleRetry}>
                            Retry                        
                        </button>
                        :
                        <>
                            {/* <Link to="/instruction">
                                <button className={styles.outterButton} >
                                    Back to Instruction
                                </button>
                            </Link> */}
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
