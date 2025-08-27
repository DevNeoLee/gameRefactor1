import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import styles from './transition.module.css';

const messages = {
    1: {
        title: "Previous Group's Experience",
        messages: [
            "Next, you’ll be shown a brief scenario describing a past event related to the upcoming exercise.",
            "Please pay attention—It may be relevant to the decisions you will make.",
        ]
    },
    2: {
        title: "Pre-Decision Questions",
        messages: [
            "Before you begin the decision-making exercise, we’ll ask you a few brief questions.",
            "These are part of the study setup and will not affect the exercise itself."
        ]
    },
    3: {
        title: "Decision Exercise",
        messages: [
            "You are about to begin the decision exercise. Get ready to start."
        ]
    },
    4: {
        title: "Final Questions",
        messages: [
            "Thank you for completing the decision exercise!",
            "Before we provide your compensation code, we would like to ask a few brief questions about you and your experience with the exercise. Please note that completing this short questionnaire is required to receive your full payment. ",
            "You will be redirected shortly."
        ]
    }
};

const MessageContent = ({ caseNumber }) => {
    
    const selectedCase = messages[caseNumber];

    return (
        <>
            { caseNumber === 1 
                ?
                <Card.Header>
                    <Card.Title style={{  fontSize: "2rem", textAlign: "center", margin: "auto 0", fontWeight: "bold", letterSpacing: "1px", color: "#454545ff"}}>Important Information Ahead</Card.Title>
                </Card.Header>
                :
                caseNumber === 2
                ?
                <Card.Header>
                    <Card.Title style={{  fontSize: "2rem", textAlign: "center", margin: "auto 0", fontWeight: "bold", letterSpacing: "1px", color: "#454545ff"}}>A Few Questions Before You Start</Card.Title>
                </Card.Header>
                :
                caseNumber === 3
                ?
                null
                :
                caseNumber === 4
                ?
                <Card.Header>
                    <Card.Title style={{  fontSize: "2rem", textAlign: "center", margin: "auto 0", fontWeight: "bold", letterSpacing: "1px", color: "#454545ff"}}>A Few Questions Before You Finish</Card.Title>
                </Card.Header>
                :
                null
            }
            <Card.Body style={{ fontSize: "2rem", width: "100%", height: "100%", padding: "4rem 4rem",backgroundColor: "#f4fbffff"}}>
                {selectedCase.messages.map((message, index) => (
                    <div 
                        key={index}
                        style={{ 
                            fontSize: "1.9rem", 
                            display: "flex", 
                            alignItems: "flex-start", 
                            justifyContent: "flex-start", 
                            width: "100%", 
                            padding: "0.8rem 2rem", 
                            lineHeight: "2" 
                        }}
                    >
                        {message}
                    </div>
                ))}
            </Card.Body>
        </>
    );
};

const TransitionNotification = ({ onStepComplete, stepTimer, gameState }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(1);

    // Determine which message to show based on the step name
    useEffect(() => {
        if (!gameState?.currentStep) return;

        // Extract the message number from the step name
        // Example: "transitionNotification1" -> 1
        const stepName = gameState.currentStep;
        const messageNumber = parseInt(stepName.replace('transitionNotification', '')) || 1;
        
        setCurrentMessageIndex(messageNumber);
    }, [gameState?.currentStep]);

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <MessageContent caseNumber={currentMessageIndex} />
            </Card>
        </div>
    );
};

export default TransitionNotification;