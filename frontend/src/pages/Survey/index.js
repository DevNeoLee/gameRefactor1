
import { Form, Button, Alert} from "react-bootstrap"
import Radio from "../../components/Radio"
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import data from "./DataQuestionnaire";
import { states } from "./DataQuestionnaire";
import styles from '../Quizzes/prequiz.module.css'
import BreadcrumbExample from '../../components/Breadcrumbs';
import Bar from '../../components/ProgressBar';
import { useLocation} from 'react-router-dom';

import { Link } from "react-router-dom"

import HOST from "../../utils/routes";
import axios from 'axios';
import { useAppContext } from '../../AppContext';

export default function Survey() {
    const {payoff, scope, setScope, setPayoff, session, setSession} = useAppContext();
    const now=98;
    const [answer, setAnswer] = useState('')
    const [answers, setAnswers] = useState([{id: '1', answer: ""}, {id: '2', answer: ""}, {id: '3', answer: ""}, {id: '4', answer: ""}, {id: '5', answer: ""}, {id: '6', answer: ""}, {id: '7', answer: ""}, {id: '8', answer: ""}, {id: '9', answer: ""}, {id: '10', answer: ""}, {id: '11', answer: ""}, {id: '12', answer: ""}, {id: '12', answer: ""}, {id: '13', answer: ""}, {id: '14', answer: ""}, {id: '15', answer: ""} ])
    const [errors, setErrors] = useState({});
    const [done, setDone] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const ALPHABET = ["a", "b", "c", "d", "e", "f"]
    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const sessionDataStorage = sessionStorage.getItem('memorySession');
      
    const scrollBox = useRef();

    const updateSessionToMongoDB = async () => {
        return await axios
          .put(`${HOST}/api/session/${session?._id}`, { gameCompleted: true, survey:  answers, timeLastUpdated: new Date()}, {new: true})
          .then(data => {
            // console.log('survey session saved: ', data)
            sessionStorage.setItem('memorySession', JSON.stringify(data));
            return data
          })
          .catch(err => console.log("survey save error: ", err))
    }


      const scrollToTop = () => {
        scrollBox.current.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
      }


    useEffect(() => {
        if (!done) {
            scrollBox.current.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
            });
        }
    },
    [done])

    const handleChange = (e) => {
        setAnswer(e.target.value)
        setAnswers(answers.map(answer => (answer.id == e.target.name) ? {...answer, answer: e.target.value} : answer))
        if (errors[e.target.name]) {
            delete(errors[e.target.name]);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        answers.forEach(answer => {
            if (!answer.answer) {
                newErrors[answer.id] = 'Answer is required'
            }
        })
      
        // Add validation for other questions as needed
        await updateSessionToMongoDB()

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            scrollToTop()
            setDone(false)
        } else {
            setSession(prev => ({...prev, gameCompleted: true}))
            setSubmitted(true);
            navigate("/goodbye")
        }
    }
    
    return (
        <div className={styles.container}>
            <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
            <Form style={{ display: "flex", justifyContent: "center"}} onSubmit={handleSubmit}>
                <div className={styles.content} ref={scrollBox}>
                    <div className={styles.box}>
                        <div className={styles.title} style={{ display: done ? "none" : "block", }}>     
                        {(Object.keys(errors).length > 0) && <Alert variant="danger">All Questions are Required to Answer!</Alert>}
                            <h1>General Survey Questions</h1> 
                        </div>
                        <div style={{ display: done ? "none" : "block", }}>
                            {data && data.questions.map((question, idx) =>(
                                <div className={styles.radio} key={question.question} >
                                <Form.Group>
                                    <div key={question.id} className="inputFrame" style={{ borderColor: errors[idx+1] ? "#a6182d" : null}}>
                                        <div style={{fontSize: "1.3rem", fontWeight: "600"}}>Question <span style={{ color: "#45838B", fontSize: "1.4rem"}}># {idx + 1}</span></div>
                                        {errors[idx + 1]&& <Alert variant="danger">{errors[idx + 1]}</Alert>}
                                        <Form.Label htmlFor={`radio`} style={{ fontWeight: "600", fontSize: "1.3rem"}}> {question.question}</Form.Label>
                                        {
                                            (question.type == "radio") ?
                                                question?.choices?.map((choice, i) => (
                                                    <Radio label={choice} key={choice} value={i + 1} answer={answer} name={idx + 1} handleChange={handleChange} required={false} />
                                                )
                                                )
                                                :
                                                (question.type == 'dropdown') ? 
                                                <Form.Control value={answers[2].answer} name="3" as="select" type="select" onChange={handleChange} aria-label="Select Option" style={{ width: "300px"}}>
                                                    <option value="" disabled >Please Select</option>
                                                    {states?.map((choice, i) => (
                                                        <option value={i} key={i}>{choice}</option>
                                                    ))}
                                                </Form.Control>
                                                :
                                                null
                                        }
                                    </div>
                                </Form.Group>
                            </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.buttonContainer}>
                        <div></div>
                        <Button className={styles.button} type="submit">
                            Submit Answers
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    );
}
