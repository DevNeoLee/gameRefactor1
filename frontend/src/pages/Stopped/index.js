
import BreadcrumbExample from '../../components/Breadcrumbs';
import styles from './stopped.module.css';
import {Link} from "react-router-dom";
import Bar from '../../components/ProgressBar';

const Stopped = () => {
  const now=90;
  return (
    <div className={styles.container}>
           {/* <div className={styles.breadcrumbContainer}><BreadcrumbExample /></div> */}

      <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
      <div className={styles.content}>
        <div className={styles.box}>
          <h1>Experiment Stopped!</h1>
          <p>Unfortunately, this experiment ended prematurely because a villager in your group left the experiment or has been idle for several minutes. As a result, you are the other villagers cannot continue the experiment. Although it is not a technical issue, we want to sincerely apologize that you are not able to complete this experiment.</p>
          <p>Nevertheless, we would like to still compensat you some fee for your participantion so far. We have calculated an average possible earnings for the rounds that you were unable to complete. These extra tokens will be added to your current earnings.</p>
          <p>This experiment ended at: exercise 2, Round 8</p>
          <p>Remaning rounds: 2</p>
          <p>Your participantion fee: 6 tokens ($0.3)</p>
          <div className={styles.buttonContainer}>

            <Link to="/questionnaire">
              <button className={styles.button}>
                  Continue to Questionnaire
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.bottomMessageBox}>
          <div className={styles.sectionLeft}>
              <p>Your role: <span>Villager</span></p>
          </div>
          <div className={styles.sectionMiddle}>
              <p className={styles.timer}>
                  Time remaining <span>60</span> seconds
              </p>
          </div>
          <div className={styles.sectionRight}>
              <p>Your total earnings until now: <span>6 tokens($0.3)</span></p>
          </div>
      </div>
    </div>
  );
}

export default Stopped;

