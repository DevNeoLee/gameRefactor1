
import BreadcrumbExample from '../../components/Breadcrumbs';
import styles from './randomlyAssigned.module.css';
import Bar from '../../components/ProgressBar';

const RandomlyAssigned = () => {
  const now=15;
  return (
    <div className={styles.container}>
           {/* <div className={styles.breadcrumbContainer}><BreadcrumbExample /></div> */}

      <div className={styles.breadcrumbContainer}><Bar now={now}/></div>
      <div className={styles.content}>
        <div className={styles.box}>
          <h1>You are randomly assigned as <span style={{ color: "#45838B", fontSize: "22px"}}>Villager</span></h1>
          <p>Click on the button below to go to the 2 practice rounds, followed by exercise 1.</p>
          <div className={styles.buttonContainer}>
            <button className={styles.button}>
                Continue
            </button>
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

export default RandomlyAssigned;

