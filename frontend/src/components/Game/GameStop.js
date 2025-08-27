import { Link } from 'react-router-dom';
import Bar from '../../components/ProgressBar';
import styles from './gamestop.module.css';
import { useEffect, useContext } from 'react';
import { useAppContext } from '../../AppContext';
import { GameContext } from '../../pages/Game'

const GameStop = () => {
    const { role, gameState, setGameState, choice, setChoice, socket, scores, setChoiceList, choiceList, extraScores, showFinalResultTable, finalScores, showGameStop, gameStopDuration} = useContext(GameContext);
    useEffect(() => {
        
        
    }, [gameState.isDepletedFirstPart, gameState.isDepletedSecondPart])


    const CompletedFirstPartMessage = () => {
        return (
            <div className={styles.box}>
            <h2>You have successfully completed Exercise 1</h2>
            <div className={styles.grayMessage}>
                <p style={{ marginBottom: "10px"}}>Great job — you’ve just completed the final round of Exercise 1 and earned tokens!</p>
                <p style={{ marginBottom: "10px"}}></p>
                <p style={{ color: "red", marginBottom: "10px"}}>➢ Now, you and other group members will continue to the next exercise (Exercise 2).</p>

            </div>
            <div style={{ textAlign: "center", padding: "5rem 0 1rem", fontSize: "1.4rem"}}>You will be redirected in  <span style={{ fontSize: "2rem", color: "red", marginRight: "0.5rem"}}>{gameStopDuration}</span>{gameStopDuration > 1 ? "seconds" : "second"}</div>
            </div>
        )
    }

    const CompletedSecondPartMessage = () => {
        return (
            <div className={styles.box}>
                <h2>You have completed the two decision exercise successfully</h2>
                <div className={styles.grayMessage}>
                    <p style={{ fontWeight: "600", fontSize: "1.3rem", marginBottom: "10px"}}>Now, you will continue to a short post-exercise survey (just a few
                        questions) that must be completed in order for you to receive full payment.</p>
                    <p style={{ marginBottom: "10px", color: "red"}}>➢ You will first receive a payment for your participation fee ($1) for watching video instructions and doing quizzes.</p>
                    <p style={{ marginBottom: "10px", color: "red"}}>➢ You will also receive completion fee ($1) for completing the post-exercise survey.</p>
                    <p style={{ marginBottom: "10px", color: "red"}}>➢ Lastly, you will receive an additional payment based on the tokens you've earned from growing crops so far.</p>
                </div>
                <div className={styles.butttonContainer}>
                    <div></div>
                    <Link to={`/survey`}>
                        <button className={styles.button}>
                            Start Survey
                        </button>
                    </Link>
                </div>     
            </div>
        )
    }

    const GameStopFirstPartMessage = () => {
        return (
            <div className={styles.box}>
                <h2>The groundwater at the end of this round is <span style={{ fontWeight: "bold", marginLeft: "0rem", color: "red", fontSize: "1.5rem"}}>below the critical depletion level (15 units) </span></h2>
                <div className={styles.grayMessage} style={{ paddingRight: "15px"}}>
                    <p style={{ marginBottom: "10px"}}>Therefore, as instructed, this exercise has ENDED before playing the last round.  
                    </p>
                    <p style={{ color: "red", marginBottom: "20px"}}>➢ Now, you and the other group members will move on to the next exercise (Exercise 2).</p>
                    <p style={{ color: "red", marginBottom: "20px"}}>➢ Although the current exercise (Exercise 1) has ended early, you will still receive your total earnings up to that point. </p>
                    <p style={{ color: "red", marginBottom: "20px"}}>➢ Please keep this window open! In a moment, you will be automatically redirected to the next exercise (Exercise 2) to continue making decisions.</p>
                </div>
                <div style={{ textAlign: "center", padding: "5rem 0 1rem", fontSize: "1.4rem"}}>You will be redirected in <span style={{ fontSize: "2rem", color: "red", marginRight: "0.5rem"}}>{gameStopDuration}</span>{gameStopDuration > 1 ? "seconds" : "second"}</div>
            </div>
        )
    }

    const GameStopSecondPartMessage = () => {
        return (
            <div className={styles.box}>
                <h2>The groundwater at the end of this round is <span style={{ fontWeight: "bold", color: "red", fontSize: "1.5rem"}}> below the critical depletion level (15 units) </span></h2>

                <div className={styles.grayMessage}>
                    <p style={{ marginBottom: "10px"}}>Therefore, as instructed, this exercise has ENDED before playing the last round. </p> 
                    <p style={{ fontWeight: "500", fontSize: "1.3rem", marginBottom: "10px"}}>Now, you will continue to a short post-exercise survey (just a few questions) that must be completed in order for you to receive full payment.</p>
                    <p style={{ color: "red", marginBottom: "20px"}}>➢ You will first receive a payment for your participation fee ($1) for watching video instructions and doing quizzes.</p>
                    <p style={{ color: "red", marginBottom: "20px"}}>➢ You will also receive completion fee ($1) for completing the post-exercise survey.</p>
                    <p style={{ color: "red", marginBottom: "20px"}}>➢ Lastly, you will receive an additional payment based on the tokens you've earned from growing crops so far.</p>
                </div>
                <div className={styles.butttonContainer}>
                    <div></div>
                    <Link to={`/survey`}>
                        <button className={styles.button}>
                            Start Survey
                        </button>
                    </Link>
                </div>        
            </div>
        )
    }


  return (
    <div className={styles.content}>
    {
        !gameState.isDepletedFirstPart && gameState.roundIndex == '11'
        ?
        <CompletedFirstPartMessage />
        :
        !gameState.isDepletedSecondPart && gameState.roundIndex == '21'
        ?
        <CompletedSecondPartMessage />
        :
        gameState.isDepletedFirstPart && gameState.roundIndex < 11
        ?
        <GameStopFirstPartMessage />
        :
        gameState.isDepletedSecondPart && gameState.roundIndex > 11
        ?
        <GameStopSecondPartMessage />
        :
        null
     }
    </div>

  );
}

export default GameStop;

