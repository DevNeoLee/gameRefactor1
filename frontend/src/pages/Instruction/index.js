
import styles from './instruction.module.css';
import { useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {Link} from "react-router-dom";
import Bar from '../../components/ProgressBar';
import { Tabs } from 'react-bootstrap';
import { Tab } from 'react-bootstrap';
import { useAppContext } from '../../AppContext';
import axios from 'axios'
import { useEffect, useRef } from 'react';
import HOST from '../../utils/routes.js';

const Instruction = () => {
    const [beginTime, setBeginTime] = useState(null)
    const [clickTabArray, setClickTabArray] = useState([])
    const { session, generation, setGeneration, variation, setVariation, ktf, setKtf, nm, setNm, setSession, timeTracker, setTimeTracker } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate()
    const now=6;
    const videoRef = useRef(null);
    const queryParams = new URLSearchParams(location.search);

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

  const updateSessionUnmount = async (clickTabArray, beginTime) => {
    await axios
    .put(`${HOST}/api/session/${session?._id}`, { timeTracker:{...timeTracker, instruction: {...timeTracker.insturction, tabChoice: clickTabArray, type: "closeWindow"}}}, {new: true})
    .then(data => {
        // sessionStorage.setItem('memorySession', JSON.stringify(data.data));

        return data.data
    })
    .catch(err => console.log(err))
}

  useEffect(() => {
    const beginTime = new Date();
    setBeginTime(beginTime)
    window.addEventListener('beforeunload', () => updateSessionUnmount(clickTabArray, beginTime));
    
    return (
        () => {
            window.removeEventListener('beforeunload', updateSessionUnmount);  
        }
    )
  
  }, [])

  const updateSessionInstruction = async (beginTime, endTime, id) => {
    await axios
    .put(`${HOST}/api/session/${id}`, { timeTracker:{...timeTracker, instruction: {beginTime: beginTime, endTime: endTime, tabChoice: clickTabArray, type: "clickButton"}}}, {new: true})
    .then(data => {
        sessionStorage.setItem('memorySession', JSON.stringify(data.data));

        let url =""
            if (!nm) {
        
                url = `/prequiz/?gen=${generation}&var=${variation}&ktf=${ktf}`;
            } else {
        
                url = `/prequiz/?nm=${nm}`;
            }
            navigate(url)
        })
        .catch(err => console.log(err))
    }

  const handleClick = () => {
    console.log('haldeClick instruction! ')
    const endTime = new Date();
    setTimeTracker(prev => ({...prev, instruction: {...prev.instruction, beginTime: beginTime, endTime: endTime, tabChoice: clickTabArray}}))
    updateSessionInstruction(beginTime, endTime, session?._id)
  }

  const handleTabSelect = (type) => {
    setClickTabArray(prev => [...prev, {choice: type, clickTime: new Date()}])

    if (type == 'text') {
        videoRef.current.pause();
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
        <div className={styles.content}>
            <div className={styles.box}>
                <div className={styles.title}>
                    <h1>Instructions on How to Play<span style={{ color: "black"}}>(click the play button)</span></h1><span></span>
                </div>
             
                <div style={{ width: "100%"}}>
                    <Tabs
                        id="uncontrolled-tab-example"
                        // fill
                        defaultActiveKey={"video"}
                        onSelect={handleTabSelect}
                    >
                        <Tab eventKey="video" title="Watch" width="50%">
                            <div className={styles.videoContainer}>
                                <video ref={videoRef} width="100%" controls>
                                    {
                                        <source src="/instructionsNearMiss.mp4" type="video/mp4" />
                                    }
                                </video>
                            </div>
                        </Tab>
                        <Tab eventKey="text" title="Read">
                            <div className={styles.pptContainer}>
                                <iframe title="iframInstruction"  src="https://docs.google.com/presentation/d/e/2PACX-1vT1ULqc3aEcMLBfUbDtBqsl3IjkG76SRZwb-Ffb6kS9slNYTqJKmboepcjkRJMwpg/pubembed?start=false&loop=false&delayms=3000" frameBorder={0} width="1150px" height="657px" allowFullScreen={true} mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>
                                {/* <iframe title="iframInstruction" src="https://docs.google.com/presentation/d/e/2PACX-1vRk0iKqHObQ42aggXfSu4cjrDnyjHjyl7gboko5ce-CwpMf6w_GYdeHdTWlakWMtw/embed?start=false&loop=false&delayms=3000" frameBorder={0} width="1150px" height="657px" allowFullScreen={true} mozallowfullscreen="true" webkitallowfullscreen="true"></iframe> */}
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <ul className={styles.paragraph}>
                    <li>  There will be <span style={{ color: "red", fontSize: "18px"}}>a short quiz</span> to assess your understanding after viewing the instruction. </li>
                    <li>  All questions need to be correctly answered to proceed to the decision exercise. </li>
                    <li>  The quiz can be attempted multiple times until you answer all questions correctly.  </li>
                    <li style={{ color: "red"}}>  You will earn $1 for watching the video instruction and taking the quiz. </li>
                </ul>
                <button className={styles.button} onClick={handleClick}>
                    Begin Quiz
                </button>
            </div>
        </div>
    </div>
  );
}

export default Instruction;