import { useState, useEffect } from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import styles from '../../pages/Game/game.module.css';
import Bar from '../../components/ProgressBar';
import { useNavigate } from "react-router-dom";

export default function WaitingRoom({ notifyParticipantLeft, gameState, clientCount, setClientCount, waitingRoomTime, session, setSession}) {
    const now=10;
    const MAX_PLAYERS = 5;

    const [waitingroomTime, setWaitingroomTime] = useState(300)
    const navigate = useNavigate();

    // Calculate remaining players needed
    const remainingPlayers = gameState.playersNeeded;

    useEffect(() => {
        if (waitingroomTime > 0) {
          const timer = setInterval(() => {
            setWaitingroomTime(prev => prev - 1);
          }, 1000);
          return () => clearInterval(timer);
        } 
    }, [waitingroomTime]);

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleExit = () => {
        navigate('/goodbye')
        notifyParticipantLeft()
    }

    const handleContinue = () => {
        setWaitingroomTime(300)
    }

    return (
    <div className={styles.container}>
        {
            waitingroomTime === 0 && gameState.currentStep == 'waitingRoom'
            ?
            <div
            className="modal show"
            style={{ display: 'block', position: 'absolute', top: "18%"}}
            >
                <Modal.Dialog>
                    <p style={{ fontSize: "24px", padding: "25px 50px 10px"}}>Time is up</p>
                    <Modal.Body>
                    <p style={{ padding: "0 35px"}}>We're Sorry for the delay, but we could not form a group because other participants haven't entered the waiting room yet.</p>
                    <br />
                    <p style={{ fontWeight: "600", padding: "0 35px", fontSize: "20px"}}>Would you like to continue waiting?</p>
                    </Modal.Body>

                    <div style={{ padding: "20px 25px 40px", width: "100%", display: "flex", justifyContent: "space-around"}}>
                    <Button variant="danger" onClick={handleExit} style={{ width: "195px"}}>No, Exit Exercise</Button>
                    <Button variant="primary" onClick={handleContinue} style={{ width: "195px"}}>Yes, Continue Waiting</Button>
                    </div>
                </Modal.Dialog>
            </div>
            :
            null
        }
        <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
            <div className={styles.content}>
                <div className={styles.box}>
                    <div className={styles.title}>
                        <h1 style={{  fontSize: "24px" }}>Waiting Room</h1>
                    </div>
                    <div style={{ display: "flex", fontSize: "22px"}}><p style={{ fontSize: "22px"}}>Thank you </p><p style={{ color: "#0000c4", fontSize: "22px"}}> for your patience!</p></div>
                    <p style={{ fontSize: "22px"}}>This is a group exercise. Please wait until other participants have read the instruction and completed the quiz. Note that this could take a few minutes.</p>
                    <div className={styles.waitingMessage} style={{ fontSize: "22px"}}>
                        You are waiting for <span style={{ fontSize: "26px", color: "#0000c4"}}>{remainingPlayers}</span> more {remainingPlayers === 1 ? 'participant' : 'participants'} to form a group…..
                    </div>
                    <p style={{ fontSize: "22px"}}>As soon as a group is formed, the first round of the exercise will start automatically.</p>
                    <div className={styles.grayMessage} style={{ fontSize: "20px"}}> If the remaining time runs out while you're still waiting, you will be asked whether you want to exit the exercise or continue waiting in the waiting room. If you choose to exit, you'll receive a code to directly collect your participation fee for this HIT.</div>
                </div>
                <div className={styles.rightImage}>
                    
                </div>
            </div>
            <div className={styles.bottomMessageBox}>
                <div className={styles.sectionLeft}>
                </div>
                <div className={styles.timerBox}>
                    <div className={styles.timer}>
                        Time remaining: 
                    </div>
                    <div className={styles.timerTick}> {formatTime(waitingroomTime)}</div>
                </div>
                <div className={styles.sectionRight}>
                </div>
            </div>
        </div>
    )
}
