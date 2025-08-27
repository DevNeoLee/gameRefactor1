import { useState, useEffect, createContext } from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
import styles from './game.module.css';
import HOST from '../../utils/routes';
import SocketSingleton from '../../utils/socket';
import axios from 'axios';
import ParticipantsReady from '../../components/Game/ParticipantsReady';
import RoleSelection from '../../components/Game/RoleSelection';
import Round from '../../components/Game/Round';
import WaitingRoom from '../../components/WaitingRoom';
import { useAppContext } from '../../AppContext'; 
import { createSessionDB } from '../../utils/functions';
import ChattingRoom from '../../components/ChattingRoom';
import HistoricText from '../../components/HistoricText';
import AdviceText from '../../components/AdviceText';
import TransitionNotification from '../../components/TransitionNotification';
import NearMissNotification from '../../components/NearMissNotification';
import NearMissPreSurvey from '../../components/NearMissPreSurvey';
import NearMissPostSurvey from '../../components/NearMissPostSurvey';
// import ImageComponent from '../../components/ImageComponent';
// import PostExperimentSurvey from '../../components/PostExperimentSurvey';
import MemorySurvey from '../../components/MemorySurvey';
import AdviceSurvey from '../../components/AdviceSurvey';

export const GameContext = createContext()

const Game = () => {
    // All hooks at the top!
    const {session, setSession, generation, variation, ktf, nm, setNm, mTurkcode, setMTurkcode, setGeneration, setVariation, setKtf, setTotalTokens, totalTokens } = useAppContext();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const navigate = useNavigate();

    // Initialize all state variables at the top
    const [socket, setSocket] = useState(null);
    const [gameStart, setGameStart] = useState(false);
    const [clientCount, setClientCount] = useState(0);

    const [roundDuration, setRoundDuration] = useState(60);
    const [resultDuration, setResultDuration] = useState(20);
    
    const [participantsReady, setParticipantsReady] = useState(false);
    const [participantsReady2, setParticipantsReady2] = useState(false);
    const [role, setRole] = useState('');
    const [socket_id, setSocket_id] = useState('');
    const [roleReady, setRoleReady] = useState(true);
    const [historicalTextReady, setHistoricalTextReady] = useState(false);
    const [roundEnd, setRoundEnd] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [showFinalResultTable, setShowFinalResultTable] = useState(false);
    const [waitingRoomTime, setWaitingRoomTime] = useState(0);

    const [count, setCount] = useState(0);
    const [showPracticeEndNotification, setShowPracticeEndNotification] = useState(false);
    const [practiceEndDuration, setPracticeEndDuration] = useState(0);
    const [gameStopDuration, setGameStopDuration] = useState(40);
    const [totalEarnings, setTotalEarnings] = useState([]);
    const [extraScores, setExtraScores] = useState([]);
    const [finalScores, setFinalScores] = useState([]);
    const [showGameStop, setShowGameStop] = useState(false);
    const [waterHeight, setWaterHeight] = useState(0);
    const [leveeHeight, setLeveeHeight] = useState(0);
    const [leveeStock, setLeveeStock] = useState(0);
    const [floodLoss, setFloodLoss] = useState(0);
    const [currentRound, setCurrentRound] = useState("");
    const [choice, setChoice] = useState('');
    const [currentStep, setCurrentStep] = useState('waitingRoom');
    const [choiceList, setChoiceList] = useState([
        {results: [], role: "Villager1", socket_id: ""},
        {results: [], role: "Villager2", socket_id: ""},
        {results: [], role: "Villager3", socket_id: ""},
        {results: [], role: "Villager4", socket_id: ""},
        {results: [], role: "Villager5", socket_id: ""},
    ]);
    const [waitingForStep, setWaitingForStep] = useState(null);
    const [stepTimer, setStepTimer] = useState({ step: null, secondsLeft: null });

    const [gameState, setGameState] = useState(() => {
        // Try to restore game state from sessionStorage
        const savedState = sessionStorage.getItem('gameState');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                // Ensure roundDuration is properly set
                if (parsedState.roundDuration === 1) {
                    parsedState.roundDuration = 60;
                }

                return parsedState;
            } catch (error) {
                console.error('Error parsing saved game state:', error);
            }
        }
        // Default state if no saved state exists
        return {
            roomName: "",
            currentStep: 'waitingRoom',
            inGame: false,
            gameDropped: false,
            participants: [],
            roundDuration: 60, // Ensure this is set to 60
            roundIndex: 0, 
            currentRound: "",
            totalRounds: 10, 
            previousLeveeStock: {},
            isDepletedFirstPart: false,
            now: 10,
            playersNeeded: 4,
            completedParticipants: 0,
            isWaitingForOthers: false,
            gameFlows: null
        };
    });

    // Add step configuration
    const stepConfig = {
        waitingRoom: { requiresSync: true },
        participantsReady: { requiresSync: true },
        roleSelection: { requiresSync: true },
        transitionNotification1: { requiresSync: true },
        transitionNotification2: { requiresSync: true },
        transitionNotification3: { requiresSync: true },
        transitionNotification4: { requiresSync: true },
        groupChat: { requiresSync: true },
        historicText: { requiresSync: true },
        rounds: { requiresSync: true },
        nearMissNotification: { requiresSync: true },
        nearMissPreSurvey: { requiresSync: false },
        memorySurvey: { requiresSync: false },
        adviceSurvey: { requiresSync: false },
        nearMissPostSurvey: { requiresSync: false }
    };

    // Modify handleStepCompletion to use room's game flow
    const handleStepCompletion = (step) => {
        if (!socket) {
            return;
        }
        
        if (stepConfig[step]?.requiresSync) {
            socket.emit('stepCompleted', { step, roomName: gameState.roomName });
        } else {
            // If next step is sync, emit asyncStepComplete
            const nextStep = getNextStep(step);
            if (nextStep && stepConfig[nextStep]?.requiresSync) {
                socket.emit('asyncStepComplete', {
                    roomName: gameState.roomName,
                    participantId: socket.id,
                    step: step
                });
                setGameState(prev => ({
                    ...prev,
                    isWaitingForOthers: true
                }));
            } else {
                socket.emit('requestNextStep', { step, roomName: gameState.roomName });
                if (nextStep) setCurrentStep(nextStep);
            }
        }
    };

    useEffect(() => {
        if (['base', 'HLRN', 'HLVN', 'LLRN', 'LLVN'].includes(queryParams.get('nm'))) {
            // console.log('near miss found: ', queryParams.get('nm'))
            setNm(queryParams.get('nm'))
        } else {
            if (!['l', 'h'].includes(queryParams.get('var'))) {
        
                navigate('/notfound')
            } else {
                setVariation(queryParams.get('var'))
            }
            if (!['1', '2', '3', '4'].includes(queryParams.get('gen'))) {
        
                navigate('/notfound')
            } else {
                setGeneration(queryParams.get('gen'))
            }
            if (!['1', '2', '3'].includes(queryParams.get('ktf'))) {
        
                navigate('/notfound')
            } else {
                setKtf(queryParams.get('ktf'))
            }
        }

    }, [queryParams])

    // Save game state to sessionStorage whenever it changes
    useEffect(() => {
        if (gameState.roomName) { // Only save if we're actually in a game
            // Don't save if we're in a transition step
            if (gameState.currentStep === 'transitionNotification') {
                return;
            }
            // Ensure we're saving the current step from the state
            const stateToSave = {
                ...gameState,
                currentStep: currentStep // Use the currentStep from state instead of gameState
            };
    
            sessionStorage.setItem('gameState', JSON.stringify(stateToSave));
        }
    }, [currentStep]);

    // Add a new effect to sync currentStep with gameState
    useEffect(() => {
        if (currentStep && currentStep !== gameState.currentStep) {
            setGameState(prev => ({
                ...prev,
                currentStep: currentStep
            }));
        }
    }, [currentStep]);

    const sessionDataStorage = sessionStorage.getItem('memorySession');

    const updateSessionToMongoDB = async (dataParams) => {
        const dataUpdate = async () => { 
          await axios
          .put(`${HOST}/api/session/${session?._id}`, { ...dataParams, timeLastUpdated: new Date()}, {new: true})
          .then(data => {
            // console.log('data: ', data.data)
            sessionStorage.setItem('memorySession', JSON.stringify(data.data));
            return data.data
          })
          .catch(err => console.log(err))
        }
        await dataUpdate();
      }

    // useEffect (() => {
    //     const sessionFind = async () => {
    //         if (!sessionDataStorage) {
    //             const sessionCreated = await createSessionDB(queryParams.get('var'));
    //             console.log('session: ', sessionCreated)
    //             setSession(sessionCreated)
    //         } else {
    //             const sessionData = JSON.parse(sessionDataStorage);
    //             console.log('sessionData: from Game sessionStorage: ', sessionData)
    //             setSession(sessionData)
    //         }
    //     }
    //     sessionFind();


 

    // Initialize session from sessionStorage or create new one
    useEffect(() => {
        const initializeSession = async () => {
            try {
        
                const storedSession = sessionStorage.getItem('memorySession');
                if (storedSession && storedSession !== 'undefined') {
            
                    const parsedSession = JSON.parse(storedSession);
                    setSession(parsedSession);
                } else {
                    const sessionCreated = await createSessionDB(variation);
                    if (sessionCreated) {
                        setSession(sessionCreated);
                        sessionStorage.setItem('memorySession', JSON.stringify(sessionCreated));
                    } else {
                        console.error('Failed to create new session');
                    }
                }
            } catch (error) {
                console.error('Error initializing session:', error);
                try {
                    const sessionCreated = await createSessionDB(variation);
                    if (sessionCreated) {
                        setSession(sessionCreated);
                        sessionStorage.setItem('memorySession', JSON.stringify(sessionCreated));
                    }
                } catch (retryError) {
                    console.error('Failed to create new session after error:', retryError);
                }
            }
        };

        initializeSession();
    }, []);

    // Socket connection effect - only runs once per session/room
    useEffect(() => {
        if (!session?._id) {
    
            return;
        }

        
        // Get the singleton socket instance
        const socket = new SocketSingleton().getInstance();
        setSocket(socket);


        // Only emit createOrJoinRoom ONCE per session/room
        socket.emit("createOrJoinRoom", { 
            sessionId: session._id, 
            nm: nm,
            generation: generation, 
            variation: variation, 
            ktf: ktf 
        });

        // Listen for joinedRoom event
        socket.on('joinedRoom', ({ roomId, roomName, size, playersNeeded, gameFlows }) => {
            setGameState(prev => ({
                ...prev, 
                roomName: roomName,
                inGame: false,
                gameDropped: false,
                participants: [],
                playersNeeded: playersNeeded,
                gameFlows: gameFlows // Store gameFlows from room
            }));
        });

        // Listen for room updates
        socket.on('roomUpdated', (room) => {
            setGameState(prev => ({
                ...prev,
                gameFlows: room.gameFlows,
                participants: room.participants || prev.participants
            }));
        });

        // Listen for game start event
        socket.on('startGame', (room) => {
            setGameState(prev => ({
                ...prev,
                inGame: true,
                gameStarted: true,
                gameStartTime: room.gameStartTime
            }));
        });

        // Listen for step changes from backend
        socket.on('stepChange', (step) => {
            // Update both currentStep and gameState
            setCurrentStep(step);
            setGameState(prev => ({
                ...prev,
                currentStep: step
            }));
        });

        // Listen for nextGameStep event
        socket.on('nextGameStep', (step) => {
            // Update both currentStep and gameState
            setCurrentStep(step);
            setGameState(prev => ({
                ...prev,
                currentStep: step
            }));
        });

        // Listen for participant leaving
        socket.on('participantLeft', ({ role }) => {
            // Show notification to remaining users
            setGameState(prev => ({
                ...prev,
                lastLeftParticipant: role
            }));
        });

        // Listen for game dropped due to participant leaving
        socket.on('gameDropped', ({ reason }) => {
            setGameState(prev => ({
                ...prev,
                gameDropped: true,
                dropReason: reason
            }));
            // navigate('/dropout?type=disconnect');
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            setGameState(prev => ({
                ...prev,
                gameDropped: true,
                dropReason: 'connection_lost'
            }));
            // navigate('/dropout?type=disconnect');
        });

        // Only emit leaveRoom on unmount
        return () => {
            if (socket && session._id) {
                socket.emit('leaveRoom', session._id);
            }
            socket.off('joinedRoom');
            socket.off('roomUpdated');
            socket.off('startGame');
            socket.off('stepChange');
            socket.off('participantLeft');
            socket.off('gameDropped');
            socket.off('disconnect');
        };
    }, [session?._id]);

    const PLAYERSLIST = [{name: "Villager1", label: "Villager 1"}, {name: "Villager2", label: "Villager 2"}, {name: "Villager3", label: "Villager 3"}, {name: "Villager4", label: "Villager 4"}, {name: "Villager5", label: "Villager5"}]
    // const [sessionDataStorage, setSessionDataStorage] = useState(JSON.parse(sessionStorage.getItem('memorySession')))

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };



    useEffect(() => {
        if (socket_id, mTurkcode, session?._id, role) {
            updateSessionWithSocketInfo(socket_id, mTurkcode, role)
        }
    }, [socket_id, mTurkcode, session?._id, role])

    function getMTurkcode(socketid) {
        const today = new Date();
    
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(today.getDate()).padStart(2, '0');
        

        return `${year}${month}${day}_${socketid}_b`;
    }

    const updateSessionWithSocketInfo = async ( socket_id, mTurkcode, role) => {
        await updateSessionToMongoDB({ socket_id: socket_id, mTurkNumber: mTurkcode, gameStarted: true, role: role})
    }

    const disconnectFromSocket = () => {
        // socket.emit("leaveRoom", sessionDataStorage?._id)
        // socket.off('client_count')
        // socket.off('leaving')
        // socket.off('left')
        // socket.off('hello_world')
        // socket.off('join')
        setSocket(null)
    }

    const notifyParticipantLeft = () => {
        // console.log('participantLeft: ', gameState.roomName)
        socket?.emit('participantLeft', gameState.roomName);
    };

    const notifyParticipantNotResponded = ({room_name, villager_id}) => {
        socket?.emit("participantNotResponded", ({room_name: room_name, villager_id: villager_id}))
        navigate('/dropout?type=400')
    };


    // Add debug logging for role assignment
    useEffect(() => {
        if (!socket) return;
        
        socket.on('roleSelected', ({ role, socketId, mTurkcode }) => {
            if (socket.id === socketId) {
                // console.log('Setting role for current user:', role);
                setRole(role);
                setSession(prev => ({ ...prev, role, mTurkcode }));
                setMTurkcode(mTurkcode)
            }
        });

        socket.on('rolesAssigned', ({ roles }) => {
            if (roles[socket.id]) {
                // console.log('Setting role from rolesAssigned:', roles[socket.id]);
                setRole(roles[socket.id]);
                setSession(prev => ({ ...prev, role: roles[socket.id] }));
            }
        });

        socket.on('nextGameStep', (step) => {
            setCurrentStep(step)
        }) 

        return () => {
            socket.off('roleSelected');
            socket.off('rolesAssigned');
            socket.off('nextGameStep');
        };
    }, [socket]);



    // Add socket event listeners for round control
    useEffect(() => {
        if (!socket) {
            // console.log('No socket available, skipping round control setup');
            return;
        }

        // Listen for round start
        socket.on('roundStart', (roundData) => {
            // console.log('Round started:', roundData);
            setCurrentRound(roundData.currentRound);
            setRoundEnd(false);
            setGameState(prev => ({
                ...prev,
                roundIndex: roundData.roundIndex,
                roundDuration: roundData.roundDuration,
                now: roundData.now,
                currentRound: roundData.currentRound
            }));
        });

        // Listen for round timer updates
        socket.on('roundDuration', (duration) => {
            // console.log('Round timer update:', duration);
            setRoundDuration(duration);
        });

        // Listen for round timer updates
        socket.on('resultDuration', (duration) => {
            // console.log('Result Duration update:', duration);
            setResultDuration(duration);
        });

        socket.on('clearRoundTimer', () => {
            // Reset your frontend timer state here
            setRoundDuration(60); // or however you're managing the timer state
        });


        // Listen for round end
        socket.on('roundEnded', (room) => {
            // console.log('Round ended:');
            setRoundEnd(true);
            // console.log('Hiding final result table:');
            setShowFinalResultTable(false);
            // setRoundDuration(60);d
        });

        socket.on('resultArrived', ({participants, roundIndex}) => {
            // console.log('Results arrived for round:', roundIndex);
            
            let choices = PLAYERSLIST.map(ele => ({...participants.find(participant => participant.role === ele.name)?.results[roundIndex], role: ele.name}));
            // console.log('Processed choices:', choices);
            setChoiceList(choices);
            setCount(prev => prev + 1);
        });

        socket.on('totalGroupResultArrived', ({waterHeight, currentLeveeHeight, currentLeveeStock, floodLoss, result, roundIndex}) => {
            // console.log('Total group results arrived:', {
            //     roundIndex,
            //     waterHeight,
            //     currentLeveeStock,
            //     currentLeveeHeight,
            //     floodLoss,
            //     result
            // });
            setWaterHeight(waterHeight);
            setLeveeHeight(currentLeveeHeight);
            setLeveeStock(currentLeveeStock);
            setFloodLoss(floodLoss);
            // Log for debugging
            // console.log('Setting waterHeight:', waterHeight, 'leveeHeight:', currentLeveeHeight);

            let choices = PLAYERSLIST.map(ele => ({...result.find(participant => participant.role === ele.name)?.results[roundIndex], role: ele.name}));
            // console.log('Processed total group choices:', choices);
            setChoiceList(choices);
            let totalEarnings = PLAYERSLIST.map(ele => ({ role: ele.name, totalEarnings: result.find(participant => participant.role === ele.name)?.totalEarnings}));
            // console.log('Total earnings for each participant: ', totalEarnings);
            setTotalEarnings(totalEarnings);
            // setTotalTokens(totalEarnings) // This was causing the error - totalEarnings is an array of objects, not a number
        });

        socket.on('gameEnded', async (room) => {
            // console.log('Game ended:', room);
            setGameEnded(true);
            // Save totalTokens to session when game ends
            if (session?._id && totalTokens !== undefined) {
                await updateSessionToMongoDB({ 
                    gameCompleted: true, 
                    totalTokens: totalTokens,
                    timeLastUpdated: new Date() 
                });
                console.log('Saved totalTokens to session:', totalTokens);
            }
        });

        socket.on('finalResultTable', (room) => {
            // console.log('Showing final result table:', room);
            setShowFinalResultTable(true);
        });

        socket.on('finalResultTableEnd', (room) => {
            // console.log('Hiding final result table:', room);
            setShowFinalResultTable(false);
            setRoundDuration(60);
            setCount(0);
        });

        socket.on("gamePrematureOver", async (room) => { 
            // console.log('gamePrematureOver 시그널이 왔네요: ', room)
            // console.log('session PrematureOver: ', session)
            //세션들에 방에서 쫓겨난 정보를 적고 데이터 베이스 세이브
            // 자기 세션에 쫓겨난 방 정보 적기
            // 유아이 정리
            // if (session) {
            //     await updateSessionToMongoDB({...session, gameDropped: true, gameCompleted: false })
            // }
            // setSession(prev => ({...prev, gameDropped: true, gameCompleted: false}))
            // 
            // setSession(prev => ({...prev, gameAttemps: [...prev?.gameAttemps, room]}))
            // await updateSessionToMongoDB({...session, gameAttemps: [...session?.gameAttemps, room]})
            navigate('/dropout?type=424')
         })

         socket.on("gameNotRespondedOver", async (roleDropped) => { 
            console.log('gameNotRespondedOver 시그널이 왔네요: 나간신분 role: ', roleDropped)
            //세션들에 방에서 쫓겨난 정보를 적고 데이터 베이스 세이브
            // 자기 세션에 쫓겨난 방 정보 적기
            // 유아이 정리
            setSession(prev => ({...prev, gameDropped: true, gameCompleted: false}))
            // await updateSessionToMongoDB({...session, gameDropped: true, gameCompleted: false})
            navigate('/dropout?type=424')
         })

         socket.on("youNotResponded", async (roleDropped) => { 
            // console.log('youNotResponded 시그널이 왔네요: 나간신분 role: ', roleDropped)
            //세션들에 방에서 쫓겨난 정보를 적고 데이터 베이스 세이브
            // 자기 세션에 쫓겨난 방 정보 적기
            // 유아이 정리
            setSession(prev => ({...prev, gameDropped: true, gameCompleted: false}))
            // await updateSessionToMongoDB({...session, gameDropped: true, gameCompleted: false})
            navigate('/dropout?type=400')
         })

         socket.on("endGameStop", () => { 
            setShowGameStop(false)
         })
    

        return () => {
            socket.off('roundStart');
            socket.off('roundDuration');
            socket.off('roundEnded');
            socket.off('resultArrived');
            socket.off('totalGroupResultArrived');
            socket.off('gameEnded');
            socket.off('finalResultTable');
            socket.off('finalResultTableEnd');

            socket.off('endGameStop');
            socket.off('youNotResponded');
            socket.off('gameNotRespondedOver');
            socket.off('gamePrematureOver');
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) {
            // console.log('No socket available, skipping participant update listener');
            return;
        }
        
        socket.on('updateParticipants', (participants) => {
            // console.log('Participants updated:', participants);
            setGameState(prev => ({
                ...prev,
                participants: participants,
                playersNeeded: 5 - participants.length
            }));
            setClientCount(participants.length);
        });
        
        return () => {
            socket.off('updateParticipants');
        };
    }, [socket]);

    // Add socket event listener for participant completion updates
    useEffect(() => {
        if (!socket) return;
        
        socket.on('participantCompleted', ({ completedCount, totalCount }) => {
            // console.log('Participant completed event received:', { completedCount, totalCount });
            setGameState(prev => ({
                ...prev,
                completedParticipants: completedCount
            }));
        });

        socket.on('allParticipantsCompleted', (step) => {
            // console.log('All participants completed event received:', step, 'Current game flows:', gameState.gameFlows);
            const nextStep = getNextStep(step);
            console.log('Next step will be:', nextStep);
            if (nextStep) {
                // Update both currentStep and gameState
                setCurrentStep(nextStep);
                setGameState(prev => ({
                    ...prev,
                    currentStep: nextStep,
                    isWaitingForOthers: false,
                    completedParticipants: 0
                }));
            }
        });

        socket.on('nextGameStep', (step) => {
            // console.log('Next game step received:', step);
            setCurrentStep(step);
        });

        return () => {
            socket.off('participantCompleted');
            socket.off('allParticipantsCompleted');
            socket.off('nextGameStep');
        };
    }, [socket]);

    // Add to useEffect for socket listeners
    useEffect(() => {
        if (!socket) return;
        socket.on('waitingForOthers', ({ step, completedCount, totalCount }) => {
            // console.log('Waiting for others event received:', { step, completedCount, totalCount });
            // Only show waiting overlay if the user is in the same step and not in waitingRoom
            // The waitingForOthers event is only sent when someone has completed the step
            if (currentStep !== 'waitingRoom' && currentStep === step) {
                setGameState(prev => ({
                    ...prev,
                    isWaitingForOthers: true,
                    completedParticipants: completedCount,
                    waitingTotal: totalCount
                }));
                setWaitingForStep(step);
            }
        });
        socket.on('stepChange', (step) => {
            setCurrentStep(step);
            setGameState(prev => ({
                ...prev,
                isWaitingForOthers: false,
                completedParticipants: 0,
                waitingTotal: 0
            }));
            setWaitingForStep(null);
        });
        return () => {
            socket.off('waitingForOthers');
            socket.off('stepChange');
        };
    }, [socket, currentStep]);

    useEffect(() => {
        window.addEventListener('beforeunload', notifyParticipantLeft);
    
        return (
            () => {
                window.removeEventListener('beforeunload', notifyParticipantLeft);  
            }
        )
      }, [gameState])

    // Update WaitingForOthers to use gameState.waitingTotal
    const WaitingForOthers = ({ completedCount, totalCount }) => {
        return (
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
                            {completedCount} of {totalCount} participants have completed
                        </div>
                        <div style={{ 
                            width: '200px', 
                            height: '10px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '5px',
                            margin: '1rem auto'
                        }}>
                            <div style={{
                                width: `${(completedCount / totalCount) * 100}%`,
                                height: '100%',
                                backgroundColor: '#4CAF50',
                                borderRadius: '5px',
                                transition: 'width 0.3s ease-in-out'
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Listen for stepTimer event from backend
    useEffect(() => {
        if (!socket) return;
        const handleStepTimer = ({ step, secondsLeft }) => {
            setStepTimer({ step, secondsLeft });
        };
        socket.on('stepTimer', handleStepTimer);
        return () => {
            socket.off('stepTimer', handleStepTimer);
        };
    }, [socket]);

    // Modify renderStep to use gameState.waitingTotal
    function renderStep(step) {
        // console.log('Rendering step:', step, 'with game state:', {
        //     roomName: gameState.roomName,
        //     inGame: gameState.inGame,
        //     gameDropped: gameState.gameDropped,
        //     participants: gameState.participants?.length
        // });
        
        const commonProps = {
            onStepComplete: () => handleStepCompletion(step),
            stepTimer: (stepConfig[step]?.requiresSync ? stepTimer : undefined),
        };
        
        const stepContent = (() => {
            switch (step) {
                case 'waitingRoom':
                    return <WaitingRoom {...commonProps} notifyParticipantLeft={notifyParticipantLeft} gameState={gameState} clientCount={clientCount} setClientCount={setClientCount} waitingRoomTime={waitingRoomTime} session={session} setSession={setSession} />;
                case 'participantsReady':
                    return <ParticipantsReady {...commonProps} gameState={gameState} clientCount={clientCount} setClientCount={setClientCount} waitingRoomTime={waitingRoomTime} session={session} setSession={setSession} />;    
                case 'roleSelection':
                    return <RoleSelection {...commonProps} role={role} />;
                case 'groupChat':
                    return (
                        <ChattingRoom 
                            {...commonProps}
                            socket={socket} 
                            role={role} 
                            gameState={gameState}
                        />
                    );
                case 'historicText':
                    return <HistoricText {...commonProps} />;
                case 'rounds':
                    return <Round {...commonProps} roundDuration={roundDuration} roundEnd={roundEnd} currentRound={currentRound} count={count} resultDuration={resultDuration} showPracticeEndNotification={showPracticeEndNotification} practiceEndDuration={practiceEndDuration} finalScores={finalScores} />;
                case 'memorySurvey':
                    return <MemorySurvey {...commonProps} />;
                case 'adviceSurvey':
                    return <AdviceSurvey {...commonProps} />;
                case 'nearMissNotification':
                    return <NearMissNotification {...commonProps} stepTimer={stepTimer} />;   
                case 'nearMissPreSurvey':
                    return <NearMissPreSurvey {...commonProps} />;
                case 'nearMissPostSurvey':
                    return <NearMissPostSurvey {...commonProps} />;
                case 'transitionNotification1':
                case 'transitionNotification2':
                case 'transitionNotification3':
                case 'transitionNotification4':
                    return <TransitionNotification {...commonProps} gameState={gameState} stepTimer={stepTimer} />;  
                default:
                    console.warn('Unknown step:', step);
                    return <div>Unknown step</div>;
            }
        })();

        // Show timer at the bottom for sync steps if not already handled in the component
        const showStepTimer = stepConfig[step]?.requiresSync && stepTimer.step === step && typeof stepContent.props?.roundDuration === 'undefined';

        return (
            <>
                {stepContent}
                {showStepTimer && stepTimer.secondsLeft !== null && step !== 'nearMissNotification' && (
                    <div style={{
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.95)',
                        color: '#0000c4',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                        textAlign: 'center',
                        padding: '0.7rem 0',
                        zIndex: 1000,
                        letterSpacing: '2px',
                        borderTop: '2px solid #0000c4',
                    }}>
                        Time remaining: <span style={{ color: '#0000c4', fontWeight: 900, fontSize: '1.5rem', width: '350px'}}>{stepTimer.secondsLeft} second<span style={{ color: '#0000c4', fontWeight: 900, fontSize: '1.5rem', }}>{stepTimer.secondsLeft === 1 ? " " : "s"}</span></span> 
                    </div>
                )}
          

                {gameState.isWaitingForOthers &&
                 waitingForStep === step &&
                 step !== 'waitingRoom' &&
                 step !== 'nearMissPreSurvey' && (
                    <WaitingForOthers 
                        completedCount={gameState.completedParticipants}
                        totalCount={gameState.waitingTotal || gameState.participants.length}
                    />
                )}
            </>
        );
    }

    // Modify getNextStep to handle missing gameFlows
    const getNextStep = (currentStep) => {
        if (!gameState.roomName) {
            console.log('No room available');
            return null;
        }

        if (!gameState.gameFlows) {
            console.log('No gameFlows available, requesting from server');
            socket?.emit('requestGameFlows', { roomName: gameState.roomName });
            return null;
        }

        const currentIndex = gameState.gameFlows.indexOf(currentStep);
        // console.log('Getting next step for:', currentStep, 'Current index:', currentIndex, 'Game flows:', gameState.gameFlows);
        
        if (currentIndex === -1 || currentIndex === gameState.gameFlows.length - 1) {
            // console.log('No next step available');
            return null;
        }
        
        const nextStep = gameState.gameFlows[currentIndex + 1];
        // console.log('Next step will be:', nextStep);
        return nextStep;
    };

    useEffect(() => {
        if (!socket) return;
        socket.on('goToSurvey', () => {
            navigate('/survey');
        });

        socket.on('goodbye', () => {
            navigate('/goodbye');
        });

        return () => {
            socket.off('goToSurvey');
            socket.off('goodbye');
        };
    }, [socket]);

    return (
        <GameContext.Provider value={{ 
            role, 
            gameState, 
            setGameState, 
            choice, 
            setChoice, 
            socket, 
            currentRound, 
            choiceList, 
            setChoiceList, 
            extraScores, 
            showFinalResultTable, 
            setShowFinalResultTable, 
            finalScores, 
            showGameStop, 
            setShowGameStop, 
            gameStopDuration, 
            waitingRoomTime, 
            notifyParticipantNotResponded, 
            notifyParticipantLeft,
            floodLoss,
            waterHeight,
            leveeHeight,
            leveeStock,
            totalEarnings

        }}>
            {renderStep(currentStep)}
            {/* {renderStep('nearMissNotification')} */}
        </GameContext.Provider>
    );
}

export default Game;