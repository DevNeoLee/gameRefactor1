
import { Table } from 'react-bootstrap';
import BreadcrumbExample from '../../components/Breadcrumbs';
import Bar from '../../components/ProgressBar';
import styles from './goodbye.module.css';
import { useAppContext } from '../../AppContext'; 

import { useEffect, useState } from 'react';

const GoodBye = () => {
  const {  
    totalTokens, 
    setTotalTokens,
    session,
    setSession,
    mTurkcode,
  } = useAppContext();

  const [completionFee, setCompletionFee] = useState(0)

  useEffect(() => {
    if (session.gameCompleted) {
      setCompletionFee(2)
    } else {
      setCompletionFee(0)
    }
  }, [session])

  const now=100;
  return (
    <div className={styles.container}>
      {/* <div className={styles.breadcrumbContainer}><BreadcrumbExample /></div> */}
      <div className={styles.breadcrumbContainer}><Bar now={now}/></div>

      <div className={styles.content}>
        <div className={styles.box}>
          <h1>Thanks for your participation in the exercise.</h1>
          <div className={styles.paragraph}>
            {/* <p>Thank you. The experiment is over now!{Math.round((totalTokens * 0.1 + 2) * 100) / 100}</p> */}
            <p><span style={{ fontWeight: "bold", fontSize: "1.3rem"}}>Your overall earnings <span className={styles.spanEmphasize}><span className={styles.unit}> $ </span> {Math.round((totalTokens * 0.04 + 1 + completionFee) * 100) / 100}</span></span> are summarized in the table below.<br/> To receive your payment, please <span style={{ fontWeight: "bold", fontSize: "1.3rem"}}> save and use the M-Turk code </span>shown in the bottom of the page.</p>
          </div>

        <div className={styles.table} style={{ border: "2px solid black"}}>
          <Table striped bordered hover>
              <tbody>
                  <tr>
                  <td><p>Total Earnings from Making Decisions</p></td>
                  <td><span className={styles.spanEmphasize}><span className={styles.unit}> $ </span> {Math.round(totalTokens * 0.04  * 100) / 100}</span>(<span className={styles.spanEmphasize}>{totalTokens} <span style={{ fontSize: "0.9rem", color: "#0000c4"}}>tokens</span></span>)</td>
                  </tr>

                  {/* <tr>
                  <td><p>Total Earning from Quiz</p></td>
                  <td><span className={styles.spanEmphasize}><span className={styles.unit}> $ </span> 1 </span></td>
                  </tr> */}

                  <tr>
                  <td><p>Participation Fee (completing a quizz)</p></td>
                  <td><span className={styles.spanEmphasize}><span className={styles.unit}> $ </span> 1 </span></td>
                  </tr>

                  <tr>
                  <td><p>Completion Fee</p></td>
                  <td><span className={styles.spanEmphasize}> <span className={styles.unit}> $ </span> {completionFee} </span></td>
                  </tr>

                  <tr>
                  <td><p>Your Overall Earnings</p></td>
                  <td><span className={styles.spanEmphasize} style={{ fontWeight: "bold"}}><span className={styles.unit}> $ </span> {Math.round((totalTokens * 0.04 + 1 + completionFee) * 100) / 100}</span></td>
                  </tr>
              </tbody>
          </Table>
        </div>

          <div className={styles.grayMessage}>
            <div className={styles.yellowMessage}>
            <h2>MTurk Code: <span className={styles.mturkcodeSpan}>{mTurkcode}</span></h2>
            </div>
            <p style={{ marginLeft: "8px", fontSize: "24px", textAlign: "left"}}><span style={{ color: "red", fontSize: "24px", fontWeight: "bold", marginRight: "8px"}}> Note: We cannot pay you unless you save and use your unique M-Turk code provided above. It is your responsibility to <span style={{ fontSize: "28px", textDecoration: "underline"}}>save this code</span>.</span><span style={{ fontSize: "24px"}}>You will receive your payment <span style={{ fontWeight: "bold", fontSize: "24px", color: "blue"}}>within 48-72 hours</span>. 
            </span> Once you have recorded it, <span style={{ fontWeight: "bold", color: "blue", fontSize: "24px"}}>you may close this window.</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoodBye;

