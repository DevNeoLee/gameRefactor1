
import Bar from '../../components/ProgressBar';
import styles from './dropout.module.css';
import { useAppContext } from '../../AppContext'; 
import { useLocation} from 'react-router-dom';

const Dropout = () => {
  const {  
    totalTokens, 
    setTotalTokens,
    mTurkcode,
  } = useAppContext();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const type = queryParams.get('type')

  const now=100;
  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
      {
        type == "424"
        ?
        <div className={styles.content}>
          <div className={styles.box}>
            <h1>Attention</h1>
            <div className={styles.paragraph}>
              <p>We regret to inform you that <span>one or more members in your group have dropped out of the exercise unexpectedly.</span> We understand that this may be disappointing, but unfortunately, without the full participation of all group members, <span>we are unable to continue the exercise for the rest of your group.</span></p>
            </div>
            <div className={styles.paragraph}>
              <p>We sincerely apologize for any inconvenience this may cause. We value your time and commitment to the exercise. <span>Within 48 - 72 hours, you will receive the participation fee of $1 plus other earnings you are entitled to.</span></p>          
            </div>
            <div className={styles.paragraph}>
              <p><span>To receive your payment, please save the unique code provided below and enter it into MTurk:</span></p>
            </div>
            <div className={styles.grayMessage}>
              <div className={styles.yellowMessage}>
                <h2>MTurk Code: <span className={styles.mturkcodeSpan}>{mTurkcode}</span></h2>
              </div>
              <p style={{ fontSize: "24px", textAlign: "left"}}><span style={{ color: "red", fontSize: "24px", fontWeight: "bold", marginRight: "8px"}}> Note: We cannot pay you unless you save and use your unique M-Turk code provided above. It is your responsibility to <span style={{ fontSize: "28px", textDecoration: "underline"}}>save this code</span>.</span><span style={{ fontSize: "24px"}}>You will receive your payment <span style={{ fontSize: "24px", fontWeight: "bold", color: "blue"}}>within 48 - 72 hours</span>. 
              </span> Once you have recorded it, <span style={{ fontWeight: "bold", color: "blue", fontSize: "24px"}}>you may close this window.</span></p>
            </div>
            <div className={styles.paragraph}>
              <p>Thank you for your understanding and cooperation.</p>        
            </div>
            <div className={styles.name}>
              <p style={{ color: 'black'}}>If you have any questions or concerns, please don't hesitate to contact us at</p>
              <p >purdue.experiment@gmail.com</p>      
            </div>
            <div className={styles.paragraph}>
              <p>Sincerely,</p>        
            </div>
            <div className={styles.name}>
              <p>Lyles School of Civil and Construction Engineering</p>
              <p>Purdue University</p>        
            </div>

          </div>
        </div>
        :
        <div className={styles.content}>
        <div className={styles.box}>
          <h1>Attention</h1>
          <div className={styles.paragraph}>
            <p>You <span>did not make your decision </span>within the allotted time limit of <span>60 seconds</span>, which was clearly indicated and communicated to everyone in your group. As a result, we regret to inform you that you are considered <span>a dropout from this decision exercise without pay</span>. 
            </p>
          </div>
          <div className={styles.paragraph}>
            <p>Participants who drop out are <span>not eligible</span> to receive payment. </p>          
          </div>
          <div className={styles.paragraph}>
            <p>Unfortunately, due to your dropout, the other villagers in your group are also <span>unable to continue the exercise</span>, resulting in its <span>termination for all participants</span>.
            </p>
          </div>
          <div className={styles.paragraph}>
            <p>Thank you for your understanding and cooperation.</p>        
          </div>
          <div className={styles.name}>
            <p style={{ color: 'black'}}>If you have any questions or concerns, please don't hesitate to contact us at</p>
            <p >purdue.experiment@gmail.com</p>      
          </div>
          <div className={styles.paragraph}>
            <p>Sincerely,</p>        
          </div>
          <div className={styles.name}>
            <p>Lyles School of Civil and Construction Engineering</p>
            <p>Purdue University</p>        
          </div>

        </div>
      </div>
      }
    </div>
  );
}

export default Dropout;

