import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './welcome.module.css';
import HOST from '../../utils/routes.js';
import Bar from '../../components/ProgressBar';
import ReCAPTCHA from "react-google-recaptcha";
import { useAppContext } from '../../AppContext'

import { createSessionDB } from '../../utils/functions';

const Welcome = () => {
    const environment = process.env.NODE_ENV
    const now=3;
    const [disabled, setDisabled] = useState(true);
    const [beginTime, setBeginTime] = useState(null)
    const { generation, variation, ktf, nm, setGeneration, setVariation, setKtf, setNm, setSession, setTimeTracker } = useAppContext();
    const location = useLocation();
    const navigate = useNavigate()
    
    const queryParams = new URLSearchParams(location.search);

    const [proceeding, setProceeding] = useState(false)

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

    useEffect(() => {
        let beginTime = new Date();
        setBeginTime(beginTime)
        setTimeTracker(prev => ({...prev, welcome: {...prev.welcome, beginTime: beginTime}}))
    }, [])

    const handleChange = () => {
        setDisabled(false);
        // console.log('reCaptcha')
    }

    const updateSessionWelcome = async (time, id) => {
        await axios
        .put(`${HOST}/api/session/${id}`, { timeTracker:{ welcome: {beginTime: beginTime, endTime: time}}}, {new: true})
        .then(data => {
            // sessionStorage.setItem('memorySession', JSON.stringify(data.data));
            // console.log('updatedSession from Welcome updateSessionWelcome: ', data.data)
            return data.data
        })
        .catch(err => {})
    }

    const handleProceed = async (variation, generation, nm) => {
        setProceeding(true)
        await createSessionDB(variation, generation, nm)
        .then(async data => {
            setSession(data);
            await updateSessionWelcome(data.sessionStartTime, data._id)
            setTimeTracker(prev => ({...prev, welcome: {...prev.welcome, endTime: data.sessionStartTime}}))
            setProceeding(false)

            let url =""
            if (!nm) {
        
                url = `/instruction/?gen=${generation}&var=${variation}&ktf=${ktf}`;
            } else {
        
                url = `/instruction/?nm=${nm}`;
            }
            navigate(url)
        })
        .catch(error => {
            console.log('error: ', error)
            setProceeding(false)
        })
    }

    return (
        <div className={styles.container}>
            <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
            <div className={styles.content}>
                <div className={styles.box}>
                    <div className={styles.title}>
                        <h1>Welcome</h1>
                        <div className={styles.logo}><img src='/purdueLogo.png' width="140px" alt="purdue logo"/></div>
                    </div>
                    <ul className={styles.paragraph}>
                        <li>  This human intelligence task (HIT) is designed by researchers at Purdue University. </li>
                        <li>  You’ll complete this HIT alongside four other real people who joined at the same time.</li>
                        <li>  It is, therefore, very important that you complete this HIT without interruptions. </li>
                        <li>  Including the time for watching/reading these instructions, the HIT will take about 40 minutes to complete. </li>
                        <li>  During the HIT, <span className={styles.bold}>please do not close this window or leave the web pages </span>in any other way.</li>
                        <li>  <span className={styles.bold}>If you close your browser or leave it idle, you will not be able to re-enter the HIT, and we will not be able to pay you! </span></li>
                        <li>  During the HIT, you will go through several decision-making rounds. Through your choices, you can earn tokens that will be converted into <span className={styles.bold}>real money</span> at the end of the HIT. </li>
                    </ul>

                    <div className={styles.butttonContainer}>
                        {
                            environment === "development"
                            ?
                            <ReCAPTCHA
                                sitekey="6LdE0_UqAAAAAA4rDq5MDSQtScT-SMWsYdeqjKPH"
                                onChange={handleChange}
                            />
                            :
                            <ReCAPTCHA      
                                sitekey="6Ld8z1crAAAAAJJqDQW0u8TNn3rS5_lBeusZGgia"
                                onChange={handleChange}
                            />
                        }
                    </div>
                    <div className={styles.butttonContainer}>
                        <button className={styles.button} 
                            disabled={disabled}
                            onClick={() => handleProceed(variation, generation, nm)}
                        >
                            { !proceeding ? "Next" : "Wait..." }
                        </button>
                    </div>
            </div>
            </div>
        </div>
    );
}

export default Welcome;

