import { Form, Button, Alert} from "react-bootstrap"
import Radio from "../Radio"
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import dataBaseline from "./dataBaseline.js";
import dataTreatment from "./dataTreatment.js";
import styles from '../../pages/Quizzes/prequiz.module.css';
import BreadcrumbExample from '../Breadcrumbs';
import Bar from '../ProgressBar';
import { useLocation} from 'react-router-dom';

import { Link } from "react-router-dom"

import HOST from "../../utils/routes";
import axios from 'axios';
import { useAppContext } from '../../AppContext';

export default function NearMissPostSurvey({  }) {
    const {payoff, scope, setScope, setPayoff, session, setSession, nm} = useAppContext();
    const now=90;
    const [answer, setAnswer] = useState('')
    const [answers, setAnswers] = useState(
        Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1), answer: "" }))
      );    
    const [errors, setErrors] = useState({});
    const [done, setDone] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const data = dataTreatment;
    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const sessionDataStorage = sessionStorage.getItem('memorySession');
      
    const scrollBox = useRef();
    const updateSessionToMongoDB = async () => {
        return await axios
          .put(`${HOST}/api/session/${session?._id}`, { gameCompleted: true, nearMissPostSurvey:  answers, timeLastUpdated: new Date()}, {new: true})
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
                            <h1 style={{ fontSize: "1.8rem", margin: "3rem", textAlign: "center"}}>A Few Questions Before You Finish</h1> 
                        </div>
                        <div style={{ fontSize: "1.4rem", marginBottom: "1.5rem"}}>
                          <p style={{ fontSize: "1.4rem", marginBottom: "1rem"}}>Now that you've completed the decision-making exercise, we would like to ask <span style={{ fontWeight: "bold", fontSize: "1.4rem"}}> a few brief questions about you and your experience with the exercise. </span> Please take a moment to answer them carefully. <span style={{ fontWeight: "bold", fontSize: "1.4rem"}}>These questions are part of the study and <u style={{ fontWeight: "bold", fontSize: "1.4rem"}}>will not affect</u> your previous responses or earnings.</span></p>
                          <p style={{ fontSize: "1.4rem", marginBottom: "1rem"}}>Please note that <span style={{ fontWeight: "bold", fontSize: "1.4rem"}}>completing this short questionnaire is required to receive your full payment. </span></p>
                        </div>
                        <div style={{ display: done ? "none" : "block", }}>
                            {data && data.questions.map((question, idx) =>(
                                <div className={styles.radio} key={question.question} >
                                <Form.Group>
                                    <div key={question.id} className="inputFrame" style={{ borderColor: errors[idx+1] ? "#a6182d" : null}}>
                                        <div style={{fontSize: "1.3rem", fontWeight: "600"}}>Question <span style={{ color: "#45838B", fontSize: "1.4rem"}}># {idx + 1}</span></div>
                                        {errors[idx + 1]&& <Alert variant="danger">{errors[idx + 1]}</Alert>}
                                        <Form.Label htmlFor={`radio`} style={{ fontWeight: "600", fontSize: "1.3rem"}}> {question.question}</Form.Label>
                                        {/* RADIO_SCALE TYPE */}
                                        {question.type === "radio_scale" ? (
                                          <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            marginTop: '15px',
                                            width: '100%',
                                            padding: '0 10px'
                                          }}>
                                            {/* Left scale label for radio_scale */}
                                            {question.scales && (
                                              <span style={{ minWidth: 40, textAlign: 'right', fontWeight: 500, fontSize: '1.2rem', marginRight: 8 }}>
                                                {question.scales[0]}
                                              </span>
                                            )}
                                            {/* Choices */}
                                            <div style={{
                                              display: 'flex',
                                              flexDirection: 'row',
                                              flexWrap: 'wrap',
                                              gap: '0',
                                              justifyContent: 'space-between',
                                              alignItems: 'flex-start',
                                              width: '100%'
                                            }}>
                                              {question?.choices?.map((choice, i) => {
                                                const radioId = `q${idx + 1}_option${i}`;
                                                return (
                                                  <div key={choice} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    width: '40px',
                                                    boxSizing: 'border-box',
                                                    margin: '0 2px',
                                                  }}>
                                                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                      <input
                                                        type="radio"
                                                        id={radioId}
                                                        name={idx + 1}
                                                        value={i}
                                                        checked={answers[idx]?.answer == i.toString()}
                                                        onChange={handleChange}
                                                        required={false}
                                                        style={{ width: 20, height: 20, accentColor: '#2a4cff', cursor: 'pointer' }}
                                                      />
                                                    </div>
                                                    <label htmlFor={radioId} style={{
                                                      fontWeight: 500,
                                                      fontSize: '1.2rem',
                                                      cursor: 'pointer',
                                                      textAlign: 'center',
                                                      marginTop: '6px',
                                                      width: '100%',
                                                      whiteSpace: 'normal',
                                                      lineHeight: 1.2,
                                                      display: 'block',
                                                    }}
                                                      dangerouslySetInnerHTML={{ __html: choice }}
                                                    />
                                                  </div>
                                                )
                                              })}
                                            </div>
                                            {/* Right scale label for radio_scale */}
                                            {question.scales && (
                                              <span style={{ minWidth: 80, textAlign: 'right', fontWeight: 500, fontSize: '1.2rem', marginRight: 8 }}>
                                                {question.scales[1]}
                                              </span>
                                            )}
                                          </div>
                                        ) : question.type === "radio" ? (
                                          // RADIO TYPE: vertical radio buttons
                                          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
                                            {question.choices?.map((choice, i) => {
                                              const radioId = `q${idx + 1}_option${i}`;
                                              return (
                                                <div key={choice} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                  <input
                                                    type="radio"
                                                    id={radioId}
                                                    name={idx + 1}
                                                    value={i}
                                                    checked={answers[idx]?.answer == i.toString()}
                                                    onChange={handleChange}
                                                    required={false}
                                                    style={{ width: 20, height: 20, accentColor: '#2a4cff', cursor: 'pointer', marginRight: '8px' }}
                                                  />
                                                  <label htmlFor={radioId} style={{
                                                    fontWeight: 500,
                                                    fontSize: '1.2rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    width: '100%',
                                                    whiteSpace: 'normal',
                                                    lineHeight: 1.1,
                                                    wordBreak: 'break-word',
                                                    display: 'block',
                                                  }}
                                                    dangerouslySetInnerHTML={{ __html: choice }}
                                                  />
                                                </div>
                                              )
                                            })}
                                          </div>
                                        ) : question.type === "select" ? (
                                          // SELECT TYPE
                                          <Form.Control
                                            as="select"
                                            value={answers[idx]?.answer}
                                            name={idx + 1}
                                            onChange={handleChange}
                                            aria-label="Select Option"
                                            style={{ width: "300px", marginTop: "10px" }}
                                          >
                                            <option value="" disabled>Please Select</option>
                                            {question.choices?.map((choice, i) => (
                                              <option value={i} key={i}>{choice}</option>
                                            ))}
                                          </Form.Control>
                                        ) : (
                                          // NO TYPE: vertical radio buttons
                                          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
                                            {question.choices?.map((choice, i) => {
                                              const radioId = `q${idx + 1}_option${i}`;
                                              return (
                                                <div key={choice} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                  <input
                                                    type="radio"
                                                    id={radioId}
                                                    name={idx + 1}
                                                    value={i}
                                                    checked={answers[idx]?.answer == i.toString()}
                                                    onChange={handleChange}
                                                    required={false}
                                                    style={{ width: 20, height: 20, accentColor: '#2a4cff', cursor: 'pointer', marginRight: '8px' }}
                                                  />
                                                  <label htmlFor={radioId} style={{
                                                    fontWeight: 500,
                                                    fontSize: '1.2rem',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    width: '100%',
                                                    whiteSpace: 'normal',
                                                    lineHeight: 1.1,
                                                    wordBreak: 'break-word',
                                                    display: 'block',
                                                  }}
                                                    dangerouslySetInnerHTML={{ __html: choice }}
                                                  />
                                                </div>
                                              )
                                            })}
                                          </div>
                                        )}
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
