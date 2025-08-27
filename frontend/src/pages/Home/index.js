import styles from './home.module.css';
import HOST from '../../utils/routes.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Home = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generation, setGeneration] = useState('');
  const [variation, setVariation] = useState('');
  const [ktf, setKtf] = useState('');
  const [nm, setNm] = useState('');

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

  const openPopUp = () => {
    try {
      setIsLoading(true);
      // Production URL format - keep commented for development
      let url =""
      if (!nm) {
        url = `/welcome/?gen=${generation}&var=${variation}&ktf=${ktf}`;
      } else {
        url = `/welcome/?nm=${nm}`;
      }
      setIsLoading(false);
      const options = 'height=10000,width=10000,toolbar=no,location=no,menubar=no,titlebar=no';
      window.open(url, '_self', options);
    } catch (err) {
      setError('Failed to open the exercise window. Please try again.');
      console.error('Error opening popup:', err);
    } 
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      setIsLoading(false);
      setError(null);
    };
  }, []);

  return (
     <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.title}>
            <h1 style={{ fontSize: "2rem", color: "#0065ff", marginBottom: "5rem", letterSpacing: "1px", lineHeight: "1.3"}}>A DECISION-MAKING EXERCISE</h1>
              <p style={{ fontSize: "1.4rem"}}>Before starting the exercise, please note the following:</p>
          </div>
          <div className={styles.paragraph}>
              <li>Watch or read the instructions carefully, as it may affect the amount of money you earn from the exercise.</li>
              <div><p style={{ marginLeft: "35px", marginTop: "10px"}}>- <span className={styles.bold}>Only laptops or desktop computers</span> can be used to play this exercise. <span className={styles.bold}>Mobile or tablet devices are not allowed</span>.</p></div>
              <div><p style={{ marginLeft: "35px"}}>- Make sure that you <span className={styles.bold}> don’t leave the browser idle </span>during the exercise; otherwise, you will not be able to continue with the exercise.</p></div>
              <li>To begin, click the start button below to open a new window. Maximize this new window to continue with the exercise. </li>
          </div>
          <div className={styles.butttonContainer}>
            {/* <button className={styles.button} onClick={() => openPopUp(`${HOST}welcome/?scope=${scope}&payoff=${payoff}`)}> */}
            <button className={styles.button} onClick={openPopUp}>
              {/* <Link 
              to={`/welcome/?scope=${scope}&payoff=${payoff}`}> */}
              {/* onClick={() => openPopUp(`${HOST}welcome/?scope=${scope}&payoff=${payoff}`)} */}
                Start
              {/* </Link> */}
            </button>
          </div>
        </div>
    </div>
  );
};

export default Home;