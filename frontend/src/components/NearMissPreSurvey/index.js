import { Form, Button, Alert} from "react-bootstrap"
import Radio from "../Radio"
import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import data from "./data.js";
import styles from '../../pages/Quizzes/prequiz.module.css';
import BreadcrumbExample from '../Breadcrumbs';
import Bar from '../ProgressBar';
import { useLocation} from 'react-router-dom';

import { Link } from "react-router-dom"

import HOST from "../../utils/routes";
import axios from 'axios';
import { useAppContext } from '../../AppContext';
import { GameContext } from '../../pages/Game';

export default function NearMissPreSurvey() {
    const {payoff, scope, setScope, setPayoff, session, setSession} = useAppContext();
    const { socket, gameState, setGameState } = useContext(GameContext);
    const now = 20;
    const [answer, setAnswer] = useState('')
    const [answers, setAnswers] = useState(
        Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1), answer: "" }))
      ); 
    const [errors, setErrors] = useState({});
    const [done, setDone] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);


    const navigate = useNavigate();

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const sessionDataStorage = sessionStorage.getItem('memorySession');
      
    const scrollBox = useRef();

    const updateSessionToMongoDB = async () => {
        // Get mTurkcode from multiple sources for reliability
        const mTurkcode = session?.mTurkcode || 
                         localStorage.getItem('mTurkcode') || 
                         sessionStorage.getItem('mTurkcode') ||
                         'UNKNOWN_MTURK';
        
        const updateData = { 
            nearMissPreSurvey: answers, 
            timeLastUpdated: new Date(),
            mTurkNumber: mTurkcode // Add mTurkNumber for consistency
        };
        
        return await axios
          .put(`${HOST}/api/session/${session?._id}`, updateData, {new: true})
          .then(data => {

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

    // Listen for waitingForOthers event to update completion count
    useEffect(() => {
        if (!socket) return;
        
        const handleWaitingForOthers = ({ step, completedCount, totalCount }) => {
            if (step === 'nearMissPreSurvey') {
                setGameState(prev => ({
                    ...prev,
                    completedParticipants: completedCount,
                    waitingTotal: totalCount
                }));
            }
        };

        socket.on('waitingForOthers', handleWaitingForOthers);
        
        return () => {
            socket.off('waitingForOthers', handleWaitingForOthers);
        };
    }, [socket]);

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
            setSubmitted(true);
            setHasCompletedSurvey(true);
            // Advance to next step using socket asyncStepComplete logic
            if (socket && gameState && gameState.roomName) {
                socket.emit('asyncStepComplete', {
                    roomName: gameState.roomName,
                    participantId: socket.id,
                    step: 'nearMissPreSurvey'
                });
                setGameState(prev => ({
                    ...prev,
                    isWaitingForOthers: true
                }));
            }
        }
    }
    
    return (
        <>
            <div className={styles.container}>
                <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
                <Form style={{ display: "flex", justifyContent: "center"}} onSubmit={handleSubmit}>
                    <div className={styles.content} ref={scrollBox}>
                        <div className={styles.box}>
                            <div className={styles.title} style={{ display: done ? "none" : "block", }}>     
                            {(Object.keys(errors).length > 0) && <Alert variant="danger">All Questions are Required to Answer!</Alert>}
                                <h1 style={{ fontSize: "1.8rem", margin: "3rem", textAlign: "center"}}>A Few Questions Before You Start</h1> 
                            </div>
                            <div style={{ fontSize: "1.4rem", marginBottom: "1.5rem"}}>
                              <p style={{ fontSize: "1.4rem", marginBottom: "1rem"}}>Before you begin the decision-making exercise, we would like to ask you a few questions about <span style={{ fontWeight: "bold", fontSize: "1.4rem"}}>how you <u style={{ fontSize: "1.4rem"}}>understood</u> and <u style={{ fontSize: "1.4rem"}}>remembered</u> the past event related to the exercise just described to you.</span></p>
                              <p style={{ fontSize: "1.4rem", marginBottom: "1rem"}}>Please take a moment to answer them carefully. These questions are part of the study setup, and your responses will not affect the exercise itself. </p>
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
                                                  <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 500, fontSize: '1.2rem', marginRight: 8 }}>
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
                                                        }}>
                                                          {choice}
                                                        </label>
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                                {/* Right scale label for radio_scale */}
                                                {question.scales && (
                                                  <span style={{ minWidth: 80, textAlign: 'center', fontWeight: 500, fontSize: '1.2rem', marginRight: 8 }}>
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
                                                      }}>
                                                        {choice}
                                                      </label>
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
                                                      }}>
                                                        {choice}
                                                      </label>
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
            
            {/* Show WaitingForOthers only after user has submitted the survey */}
            {hasCompletedSurvey && gameState.isWaitingForOthers && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(60, 60, 60, 0.78)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    zIndex: 1000
                }}>
                    <div style={{
                        padding: '8rem 4rem',
                        backgroundColor: 'rgba(164, 164, 164, 1)',
                        borderRadius: '1rem',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Please wait until other participants have completed answering the pre-exercise questions. </h2>
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                                {gameState.completedParticipants} of {gameState.waitingTotal || gameState.participants.length} participants have completed
                            </div>
                            <div style={{ 
                                width: '200px', 
                                height: '10px', 
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '5px',
                                margin: '1rem auto'
                            }}>
                                <div style={{
                                    width: `${(gameState.completedParticipants / (gameState.waitingTotal || gameState.participants.length)) * 100}%`,
                                    height: '100%',
                                    backgroundColor: '#4CAF50',
                                    borderRadius: '5px',
                                    transition: 'width 0.3s ease-in-out'
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
