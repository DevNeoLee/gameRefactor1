
import styles from './stat.module.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState} from 'react';
import HOST from "../../utils/routes";
import Accordion from 'react-bootstrap/Accordion';
import NeverStartedGames from '../../components/Stats/NeverStartedGames';
import GamesStartedDroppedAfterPractices from '../../components/Stats/GamesStartedDroppedAfterPractices';
import GamesStartedDroppedBeforePractices from '../../components/Stats/GamesStartedDroppedBeforePractices';
import GamesCompleted from '../../components/Stats/GamesCompleted';
import SessionsAll from '../../components/Stats/SessionsAll';
import SessionsCompleted from '../../components/Stats/SessionsCompleted';
import axios from 'axios';
import { FiletypeCsv } from 'react-bootstrap-icons';
import { CSVLink } from 'react-csv';
import { states } from '../Survey/DataQuestionnaire';

const Stat = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate()

  const [dataGames, setDataGames] = useState(null);
  const [dataSessions, setDataSessions] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')

  const [sessionsCompleted, setSessionsCompleted] = useState([])

  const [neverStartedGames, setGamesAtWaitingRoom] = useState([]);
  const [notMadeToActualRounds, setNotMadeToActualRounds] = useState([]);
  const [gamesDroppedDuringRounds, setGamesDroppedDuringRounds] = useState([]);
  const [completedGames, setCompletedGames] = useState([]);
  const [csvObject, setCsvObject] = useState([
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Jane', age: 25, city: 'Los Angeles' },
    { name: 'Mary', age: 35, city: 'Chicago' }
  ])

  const GAME_FLOWS = {
    // all generation 1
    1: [
      'waitingRoom',
      'participantsReady',
    //   'roleSelection',
    //   'rounds',
    //   'transitionNotification',
    //   'groupChat',
    //   'memorySurvey',
      'adviceSurvey',
    ],
    // generation 2 or 3, ktf 1
    2: [
      'waitingRoom',
    //   'participantsReady',
    //   'roleSelection',
    //   'historicText',
    //   'transitionNotification',
    //   'groupChat',
      'rounds',
    //   'memorySurvey',
    ],
    // generation 2 or 3, ktf 2
    3: [
      'waitingRoom',
    //   'participantsReady',
    //   'roleSelection',
    //   'historicText',
    //   'transitionNotification',
    //   'groupChat',
    //   'rounds',
    //   'memorySurvey',
      'adviceSurvey',
    ],
    // all generation 4
    4: [
      'waitingRoom',
    //   'participantsReady',
    //   'roleSelection',
    //   'historicText',
    //   'transitionNotification',
    //   'groupChat',
      'memorySurvey',
      'rounds',
    ],
    5: [
        'waitingRoom',
        'participantsReady',
        'roleSelection',
        'transitionNotification3',
        'rounds',
        'transitionNotification4',
        'nearMissPostSurvey',
    ],
    6: [
        'waitingRoom',
        'participantsReady',
        'roleSelection',
        'transitionNotification1',
        'nearMissNotification',
        'transitionNotification2',
        'nearMissPreSurvey',
        'transitionNotification3',
        'rounds',
        'transitionNotification4',
        'nearMissPostSurvey',
    ],
};

  useEffect(() => {
    const prepareCSV = async () => {
      const apiUrlGame = `${HOST}/api/game?year=${queryParams.get('year')}&month=${queryParams.get('month')}&day=${queryParams.get('day')}`;
      const apiUrlSession = `${HOST}/api/session?year=${queryParams.get('year')}&month=${queryParams.get('month')}&day=${queryParams.get('day')}`;

      const objectOrder = [
        "date",
        "quiz",
        "MTurk Code",
        "treatment",
        "Group ID",
        "Role",
        "Round 1 Location",
        "Round 1 Invest Levee",
        "Round 1 Levee Stock",
        "Round 1 Levee Height",
        "Round 1 River Height",
        "Round 1 Flood Loss",
        "Round 1 Earnings",
        "Round 2 Location",
        "Round 2 Invest Levee",
        "Round 2 Levee Stock",
        "Round 2 Levee Height",
        "Round 2 River Height",
        "Round 2 Flood Loss",
        "Round 2 Earnings",
        "Round 3 Location",
        "Round 3 Invest Levee",
        "Round 3 Levee Stock",
        "Round 3 Levee Height",
        "Round 3 River Height",
        "Round 3 Flood Loss",
        "Round 3 Earnings",
        "Round 4 Location",
        "Round 4 Invest Levee",
        "Round 4 Levee Stock",
        "Round 4 Levee Height",
        "Round 4 River Height",
        "Round 4 Flood Loss",
        "Round 4 Earnings",
        "Round 5 Location",
        "Round 5 Invest Levee",
        "Round 5 Levee Stock",
        "Round 5 Levee Height",
        "Round 5 River Height",
        "Round 5 Flood Loss",
        "Round 5 Earnings",
        "Round 6 Location",
        "Round 6 Invest Levee",
        "Round 6 Levee Stock",
        "Round 6 Levee Height",
        "Round 6 River Height",
        "Round 6 Flood Loss",
        "Round 6 Earnings",
        "Round 7 Location",
        "Round 7 Invest Levee",
        "Round 7 Levee Stock",
        "Round 7 Levee Height",
        "Round 7 River Height",
        "Round 7 Flood Loss",
        "Round 7 Earnings",
        "Round 8 Location",
        "Round 8 Invest Levee",
        "Round 8 Levee Stock",
        "Round 8 Levee Height",
        "Round 8 River Height",
        "Round 8 Flood Loss",
        "Round 8 Earnings",
        "Round 9 Location",
        "Round 9 Invest Levee",
        "Round 9 Levee Stock",
        "Round 9 Levee Height",
        "Round 9 River Height",
        "Round 9 Flood Loss",
        "Round 9 Earnings",
        "Round 10 Location",
        "Round 10 Invest Levee",
        "Round 10 Levee Stock",
        "Round 10 Levee Height",
        "Round 10 River Height",
        "Round 10 Flood Loss",
        "Round 10 Earnings",
        "Final Game Score",
        "Pre-survey Q1",
        "Pre-survey Q2", 
        "Pre-survey Q3",
        "Pre-survey Q4",
        "Pre-survey Q5",
        "Pre-survey Q6",
        "Pre-survey Q7",
        "Pre-survey Q8",
        "Pre-survey Q9",
        "Pre-survey Q10",
        "Pre-survey Q11",
        "Pre-survey Q12",
        "Post-survey Q1",
        "Post-survey Q2",
        "Post-survey Q3",
        "Post-survey Q4",
        "Post-survey Q5",
        "Post-survey Q6",
        "Post-survey Q7",
        "Post-survey Q8",
        "Post-survey Q9",
        "Post-survey Q10",
        "Post-survey Q11",
        "Post-survey Q12",
        "Post-survey Q13",
        "Post-survey Q14",
        "Post-survey Q15"
      ]

  

      const generatecsvObject = async (dataGame, year, month, day, sessions) => {
        // console.log('dataGame: ', dataGame)
        const csvArray = [];

        const getInvestedLevees = (game) => {
          // console.log('results 111: ', dataGame[0].participants)
          const participants = game?.participants;
          const investedLevees = []
          for (let i = 0 ; i < 10 ; i++ ){
              const investedLevee = participants?.reduce((acc, value) => parseInt(value.results[i]?.choice) + acc, 0) || "NA"
              investedLevees.push(investedLevee)
          }
          // console.log("investedLevees: ", investedLevees)
          return investedLevees;
        }
        


        for (let game of dataGame) {

          const investedLevees = game.stockInvested;
          const leveeStocks = game.leveeStocks;
          const leveeHeights = game.leveeHeights;
          const riverHeights = game.waterHeights;
          const floodLosses = game.floodLosses;
 
          const sortedParticipants = [...game.participants].sort((a, b) => {
            const aNum = parseInt(a.role.replace(/\D/g, '')) || 0;
            const bNum = parseInt(b.role.replace(/\D/g, '')) || 0;
            return aNum - bNum;
          })


        const getResultSorted = (results) => {
          let resultSorted = {};

          results.forEach((result, index) => {
            if (result.choice !== null) {
              resultSorted = {
                ...resultSorted,
                [`Round ${index + 1} Location`]: result.choice == 0 ? 'Far' : 'Near',
                [`Round ${index + 1} Invest Levee`] : result.choice,
                [`Round ${index + 1} Levee Stock`]: leveeStocks[index],
                [`Round ${index + 1} Levee Height`] : leveeHeights[index], 
                [`Round ${index + 1} River Height`]: riverHeights[index],
                [`Round ${index + 1} Flood Loss`] : floodLosses[index], 
                [`Round ${index + 1} Earnings`]: result.earningAfterLoss,
              }
            } else {
              resultSorted = {
                ...resultSorted,
                [`Round ${index + 1} Location`]: 'NA',
                [`Round ${index + 1} Invest Levee`] : 'NA', 
                [`Round ${index + 1} Levee Stock`]: 'NA',
                [`Round ${index + 1} Levee Height`] : 'NA', 
                [`Round ${index + 1} River Height`]: 'NA',
                [`Round ${index + 1} Flood Loss`] : 'NA', 
                [`Round ${index + 1} Earnings`]: 'NA',
              }
            }
          })
          return resultSorted;
        }
          
          for (let participant of sortedParticipants) {
            const resultSorted = getResultSorted(participant.results);
            
            const participantSession = sessions.find(session => {

              // Use game participant ID to match with session _id
              const sessionMTurkNumber = session.mTurkNumber ? String(session.mTurkNumber).trim() : '';
              const participantMTurkcode = participant.mTurkcode ? String(participant.mTurkcode).trim() : '';
            
              return participantMTurkcode === sessionMTurkNumber && sessionMTurkNumber !== '';
            });

            // Get Pre-survey data (12 questions)
            const preSurveyData = {};
            if (participantSession?.nearMissPreSurvey) {
              for (let i = 1; i <= 12; i++) { 
                preSurveyData[`Pre-survey Q${i}`] = participantSession?.nearMissPreSurvey[i - 1]?.answer || 'NA';
              }
            } else {
              // Fill with NA if no pre-survey data
              for (let i = 1; i <= 12; i++) {
                preSurveyData[`Pre-survey Q${i}`] = 'NA';
              }
            }
            // Get Post-survey data (15 questions)
            const postSurveyData = {};
             if (participantSession?.nearMissPostSurvey) {
              for (let i = 1; i <= 15; i++) { 
                // console.log('participantSession?.nearMissPostSurvey: ', participantSession?.nearMissPostSurvey)
                if (participantSession?.nearMissPostSurvey[i - 1]?.id == '3') {
                  postSurveyData[`Post-survey Q${i}`] = states[Number(participantSession?.nearMissPostSurvey[i - 1].answer)]
                } else {
                  postSurveyData[`Post-survey Q${i}`] = participantSession?.nearMissPostSurvey[i - 1]?.answer || 'NA';
                }

              }
            } else {
              // Fill with NA if no post-survey data
              for (let i = 1; i <= 15; i++) {
                postSurveyData[`Post-survey Q${i}`] = 'NA';
              }
            }
            // Calculate Final Game Score (sum of all round earnings)
            const finalGameScore = participant.results.reduce((total, result) => {
              return total + (result.totalEarnings || 0);
            }, 0);

            csvArray.push({
              date: `${year}-${month}-${day}`,
              quiz: 1,
              "MTurk Code": participant.mTurkcode ? participant.mTurkcode : "",
              "treatment": game.nm,
              "Group ID": game.roomName,
              "Role": participant.role,
              ...resultSorted,
              "Final Game Score": participant.totalEarnings || 'NA',
              ...preSurveyData,
              ...postSurveyData
            })
          }
        }
        // console.log('data csvObject before: ' , csvArray)
        // console.log('data csv sessions: ' , sessions)

        // 이날 들어왔던 모든 사람들(세션들)의 자료 하나하나에서 csvArray모은 자료를 기반으로 해서
        sessions.forEach(session => {
          //   session.survey.forEach(item => {
          //     if (item.id == '3') {
          //       // console.log('states[Number(item.answer)]: ', states[Number(item.answer)])
          //       surveyObject[`Survey Q${item.id}`] = states[Number(item.answer)]
          //     } else {
          //       surveyObject[`Survey Q${item.id}`] = Number(item.answer)
          //     }
          //   }))
          //게임에 들어가지는 못했으나 퀴즈는 푼(엠터크 코드는 있는 사람들) 추가
          // if (session.mTurkNumber && !csvArray.find(ele => ele["MTurk Code"] == session.mTurkNumber )) {
          //   const mappedSession = {
          //     date: `${year}-${month}-${day}`,
          //     type: `${session.scope}${session.payoff}`,
          //     "MTurk Code": session.mTurkNumber ? session.mTurkNumber : "",
          //     "Quiz 1": session.preQuiz.length > 0 ? 1 : 0,
          //     "Quiz 2": 0,
          //     "Group ID": "",
          //     "Villager ID": "",
          //   }
          //   csvArray.push(mappedSession)
          // //서베이 마친 결과를 게임을 온전히 끝낸 그룹에게 넣어주기
          // } else if ( session.survey.length > 0 && session.mTurkNumber && csvArray.find(ele => ele["MTurk Code"] == session.mTurkNumber)) {
          //   const surveyObject = {};
          //   // console.log('session.survey: ', session.survey)
     

          //   // console.log('surveyObject: ', surveyObject)

          //   csvArray.forEach((ele, i) => {
          //     if (ele["MTurk Code"] == session.mTurkNumber) {
          //       csvArray[i] ={ ...ele, ...surveyObject}
          //     } 
          //   })
          
          // }
        })

        const orderedCSVArray = csvArray.map(object => {
          const sortedObj = objectOrder.reduce((acc, key) => {
            if (object.hasOwnProperty(key)) {
              acc[key] = object[key];  // Add keys based on the custom order
            }
            return acc;
          }, {});
          return sortedObj;
        })

        // console.log('data csvObject after: ' , orderedCSVArray)
        setCsvObject(orderedCSVArray)
      }

      const fetchDataSessions = async () => {
          try {
            const response = await axios.get(apiUrlSession);
         
            if (response.data.data) {
              setDataSessions(response.data.data); 
              processSessions(response.data.data);
              return response.data.data;
            } 
          } catch (err) {
            setError(err.message); // Set error if any
          } finally {
            setLoading(false); // Set loading to false after fetching is done
          }
      };

      const fetchDataGames = async (year, month, day, sessions) => {
          const response = await axios.get(apiUrlGame);

        if (response) {
          setDataGames(response.data.data); 
          processGames(response.data.data);
          generatecsvObject(response.data.data, year, month, day, sessions);
        }
      };

      if (queryParams.get('year') && queryParams.get('month') && queryParams.get('day')) {
          setYear(queryParams.get('year'))
          setMonth(queryParams.get('month'))
          setDay(queryParams.get('day'))
          const anySession = await fetchDataSessions();

          if (anySession) {
            fetchDataGames(queryParams.get('year'), queryParams.get('month'), queryParams.get('day'), anySession);
              }
          } else {
              console.log('not matched parameters')
              navigate('/notfound')
          }
    }
   prepareCSV();
  }, [])



  const processSessions = (sessions) => {  
    const sessionsCompleted = sessions.filter(session => session.gameCompleted)
    setSessionsCompleted(sessionsCompleted);
  }

  const processGames = (games) => {  
    const gamesAtWaitingRoom = games.filter(game => game.currentStep === 'waitingRoom')
    setGamesAtWaitingRoom(gamesAtWaitingRoom)

    const gamesNeverMadeToActualRounds = games.filter(game => GAME_FLOWS[6].slice(1, 8).includes(game.currentStep))

    setNotMadeToActualRounds(gamesNeverMadeToActualRounds)

    const gamesDroppedDuringRounds = games.filter(game => !game.gameCompleted && game.currentStep === 'rounds' && game.gameDropped)

    setGamesDroppedDuringRounds(gamesDroppedDuringRounds)

    const gamesCompleted = games.filter(game => game.gameCompleted && game.currentStep === 'rounds')
    setCompletedGames(gamesCompleted)   
  }

  // Render the component UI
  if (loading) {
      return <div>Loading...</div>;
  }
  
  if (error) {
      return <div>Error: {error}</div>;
  }

  if (dataSessions) {
      return (
          <div className={styles.container}>
            <div className={styles.box}>
              <div className={styles.title}>
                  <h1 style={{ fontSize: "2rem", color: "#0000c4", marginBottom: "3rem", letterSpacing: "1px", lineHeight: "1.3"}}>Daily Statistics</h1>
                  <div className={styles.menu}>
                    <h2 style={{ marginRight: "10rem", fontSize: "2rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3"}}>{year}-{month}-{day} <span style={{ color: "darkblue"}}>games: <span style={{ color: "blue"}}>{JSON.stringify(dataGames?.length)}, </span></span><span style={{ color: "darkblue"}}>sessions: <span style={{ color: "blue"}}>{JSON.stringify(dataSessions?.length)}</span></span> </h2>
                    <CSVLink
                      data={csvObject}
                      filename="data.csv"
                    >
                      <FiletypeCsv size="30" className={styles.csvFile}/>
                    </CSVLink>
                  </div>
              </div>
              <div className={styles.paragraph}>
                <h2 style={{ fontSize: "2rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3"}}>Games ( {JSON.stringify(dataGames?.length)} )</h2>
                <div style={{ padding: "1rem", margin: "0.5rem"}}>
                  <Accordion defaultActiveKey={null}>
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>
                        <h3 style={{ fontSize: "1.5rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3", marginLeft: "2rem"}}>'Rounds' Never Started at Waiting Room( {neverStartedGames.length} )</h3>
                      </Accordion.Header>
                      <Accordion.Body>
                        <NeverStartedGames data={neverStartedGames}/>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
                <div style={{ padding: "1rem", margin: "0.5rem"}}>
                  <Accordion>
                  <Accordion.Item eventKey="2">
                    <Accordion.Header>
                      <h3 style={{ fontSize: "1.5rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3", marginLeft: "2rem"}}>Dropped Before Any 'Rounds' Started( {notMadeToActualRounds.length} )</h3>
                    </Accordion.Header>
                    <Accordion.Body>
                      <GamesStartedDroppedBeforePractices data={notMadeToActualRounds} />
                    </Accordion.Body>
                  </Accordion.Item>
                  </Accordion>
                </div>
                <div style={{ padding: "1rem", margin: "0.5rem"}}>
                  <Accordion>
                  <Accordion.Item eventKey="2">
                    <Accordion.Header>
                      <h3 style={{ fontSize: "1.5rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3", marginLeft: "2rem"}}>'Rounds' Started but Dropped ( {gamesDroppedDuringRounds.length} )</h3>
                    </Accordion.Header>
                    <Accordion.Body>
                      <GamesStartedDroppedBeforePractices data={gamesDroppedDuringRounds} />
                    </Accordion.Body>
                  </Accordion.Item>
                  </Accordion>
                </div>
                <div style={{ padding: "1rem", margin: "0.5rem"}}>
                  <Accordion>
                    <Accordion.Item eventKey="3">
                      <Accordion.Header>
                        <h3 style={{ fontSize: "1.5rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3", marginLeft: "2rem"}}>All Game Steps Completed ( {completedGames.length} )</h3>
                      </Accordion.Header>
                      <Accordion.Body>
                        <GamesCompleted 
                          data={completedGames} 
                        />
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </div>
              <div className={styles.paragraph}>
                <h2 style={{ fontSize: "2rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3"}}>Sessions ( 
                  {JSON.stringify(dataSessions?.length)} 
                  )</h2>
                <div style={{ padding: "1rem", margin: "0.5rem"}}>
                  <Accordion>
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>
                        <h3 style={{ fontSize: "1.5rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3", marginLeft: "2rem"}}>People who Completed All Game Steps( {sessionsCompleted.length} )</h3>
                      </Accordion.Header>
                      <Accordion.Body>
                        <SessionsCompleted data={sessionsCompleted} />
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
                <div style={{ padding: "1rem", margin: "0.5rem"}}>
                  <Accordion>
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>
                        <h3 style={{ fontSize: "1.5rem", color: "#0000c4", letterSpacing: "1px", lineHeight: "1.3", marginLeft: "2rem"}}>All Sessions( {dataSessions?.length} )</h3>
                      </Accordion.Header>
                      <Accordion.Body>
                        <SessionsAll 
                          data={dataSessions}
                        />
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        );
  }
 
}

export default Stat;