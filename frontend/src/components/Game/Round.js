import { useState, useEffect, useContext } from 'react';
import styles from './practice.module.css';
import Bar from '../ProgressBar';
import { VillagersDecision, Result, FinalResult } from '../DecisionResult';
import { GameContext } from '../../pages/Game'
import { useAppContext } from '../../AppContext';
import GameStop from './GameStop';

const Round = ({ roundDuration, roundEnd, currentRound, resultDuration, count, showPracticeEndNotification, practiceEndDuration}) => {
    const [round, setRound] = useState(1)
    const [game, setGame] = useState(true);
    const [error, setError] = useState(false);
    const [myTotalEarning, setMyTotalEarning] = useState(0);

    const {setTotalTokens} = useAppContext();
    const { notifyParticipantNotResponded, role, gameState, session, setGameState, choice, setChoice, socket, scores, setChoiceList, choiceList, extraScores, showFinalResultTable, finalScores, showGameStop, totalEarnings} = useContext(GameContext);

    useEffect(() => {
        if (choice) {
            setError(false)
        };
    }, [choice])

    // Update earnings whenever totalEarnings changes or when results arrive
    useEffect(() => {
        if (totalEarnings && Array.isArray(totalEarnings)) {
    
            const myEarning = totalEarnings.find(earning => earning.role === role);
            if (myEarning) {

                const finalEarnings = myEarning.totalEarnings || 0;
                setMyTotalEarning(finalEarnings);
                // Update AppContext totalTokens with the final earnings
                setTotalTokens(finalEarnings);
            }
        }
    }, [totalEarnings, role, choiceList, setTotalTokens]);

    useEffect(() => {
        if (roundEnd) {
            setGame(false);
        } else {
            setChoice('')
            setChoiceList([[], [], [], [], []])
            setGame(true);
        }
    }, [roundEnd])

    useEffect(() => {
        const myChoice = choiceList.find(choice => choice.role == role)
        if (roundDuration == 0 && !myChoice?.choice) {
            // Time's up but no choice made
            notifyParticipantNotResponded({room_name: gameState?.roomName, villager_id: socket.id})
        }
        // console.log('roundDuration: ', roundDuration)
    }, [roundDuration])

    const handleDecision = () => {
        if (choice) {
            socket?.emit("decisionNotice", {room_name: gameState?.roomName, villager_id: socket.id, choice})
            setGame(false)
        } else {
            setChoice('')
            setError(true)
        }
    }

    const getMyFinalTokens = (finalScores, extraScores) => {
        // console.log('finalScores, extraScores: getMyFinalTokens:', finalScores, extraScores)
        // console.log('role: getMyFinalTokens: ', role)
        const myFinalScore = finalScores[Number(role.slice(6,7)) - 1];
        const myExtraScore = extraScores[Number(role.slice(6,7)) - 1];

        // console.log('myFinalScore, myExtraScore: getMyFinalTokens:', myFinalScore, myExtraScore)

        return myExtraScore ? myFinalScore + myExtraScore : myFinalScore;
    }

    return (
        <div className={styles.container}>
            <div className={styles.breadcrumbContainer}><Bar now={gameState?.now}/></div>
            <div className={styles.topInfo}>
                <div>
                    <p>You are <span style={{ fontSize: "21px"}}>{role.replace(/.{8}/g, "$&" + " ")}</span></p>
                </div>    
                <div style={{ marginRight: "1rem"}}>
                    <div style={{ display: "flex", fontSize: "1.3rem"}}>
                       <div style={{ fontSize: "1.3rem"}}>Your cumulative earnings: </div>
                       <div style={{ fontSize: "1.3rem", padding: "0 0 0 0.5rem", color: "#0000c4"}}> {myTotalEarning} {myTotalEarning === 1 ? "token" : "tokens"}</div>
                   </div>
                </div>
            </div>
            {/* <Result currentRound={currentRound} resultDuration={resultDuration}/> */}
            {
                showGameStop ?
                <GameStop/>
                :
                showFinalResultTable ?
                <div className={styles.content}>
                    <div className={styles.title}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}><h1>Summary </h1></div>
                    </div>
                    <FinalResult currentRound={currentRound} resultDuration={resultDuration} showPracticeEndNotification={showPracticeEndNotification} practiceEndDuration={practiceEndDuration} finalScores={finalScores}/>
                </div>
                :
                <div className={styles.content} >
                    <div className={styles.title}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", zIndex: "1000"}}><h1>Round {currentRound} - {game ? "Decision" : "Result"}</h1></div>
                    </div>
                    <div style={{ display: game && role?.includes("Villager") ? "block" : "none"  }}><VillagersDecision currentRound={currentRound} /></div>
                    <div style={{ display: !game ? "block" : "none" }}><Result currentRound={currentRound} resultDuration={resultDuration} showPracticeEndNotification={showPracticeEndNotification} practiceEndDuration={practiceEndDuration}/></div>
                    {/* <div style={{ display: game ? "block" : "none" }}><Result currentRound={currentRound} resultDuration={resultDuration} showPracticeEndNotification={showPracticeEndNotification} practiceEndDuration={practiceEndDuration}/></div> */}

             </div>
            }
            <div className={styles.bottomMessageBox } style={{ position: "relative"}}>
                {
                !showGameStop        
                ?
                <div className={styles.temporaryButtons}>
                    <div className={styles.temporayButtonsContent} >
                        {
                        game ?
                        <div style={{width: "200px"}} >
        
                        </div>
                        :
                        null
                        }
                        <div className={styles.sectionMiddle}>
                        {
                        showFinalResultTable ?
                        <div style={{ width: "100%", position: "absolute", left: "0"}}><div style={{ fontSize: "1.4rem", margin: "0 auto", position: "relative", textAlign: "center"}}> You will be redirected  <span style={{color: "red", fontSize: "1.6rem"}}>{resultDuration}</span> {(resultDuration == 0 || resultDuration == 1) ? "second" : "seconds"}</div></div>
                        :
                        (game && count != 5 && !showGameStop) ? 
                        <p className={styles.timer}>
                            Next round will begin in <span style={{ color: "#0000c4"}}>{roundDuration}</span> seconds
                        </p>
                        :
                        (count != 5 && !showGameStop) ? 
                        null
                        :
                        !showGameStop ?
                        <div style={{ width: "100%", position: "absolute", left: "0"}}><div style={{ fontSize: "1.4rem", margin: "0 auto", position: "relative", textAlign: "center"}}> Next round will begin in <span style={{color: "#0000c4", fontSize: "1.6rem"}}>{resultDuration}</span> {(resultDuration == 0 || resultDuration == 1) ? "second" : "seconds"}</div></div>
                        :
                        <div style={{ width: "100%", position: "absolute", left: "0"}}><div style={{ color: "red", fontSize: "1.4rem", margin: "0 auto", position: "relative", textAlign: "center"}}> You will be redirected  <span style={{color: "red", fontSize: "1.6rem"}}>{resultDuration}</span> {(resultDuration == 0 || resultDuration == 1) ? "second" : "seconds"}</div></div>

                        }
                        </div>

                    {error ? <h1 style={{ position: "absolute", right: "10px", bottom: "-55px", color: "#a6182d"}}>*Please select your choice.</h1>: null}
                    {
                        game && !showFinalResultTable && !showGameStop
                        ?
                        <button className={`${styles.outterButton} ${choice ? styles.blinker : ''}`} onClick={handleDecision} style={{ color: error ? "#a6182d" : null, border: error ? "1px solid #a6182d": null}}>
                            MAKE DECISION
                        </button>
                        :
                        <div style={{ width: "230px"}}></div>
                    }
                    </div>
                </div>
                :
                <div></div>
                }
            </div>
        </div>
    );
}

export default Round;