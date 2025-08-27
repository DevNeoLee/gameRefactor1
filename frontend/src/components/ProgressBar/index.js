import { ProgressBar } from 'react-bootstrap';
import styles from './progressBar.module.css';

const Bar = ({now}) => {
  return (
    <div className={styles.container}>
    <ProgressBar now={now} variant="secondary"/>
    {/* //     <div class={styles.root}>
    //       <div class={styles.container}>
    //         <ul class={styles.progressbar}>
    //         <li class={styles.active}>Step 0</li>
    //           <li class={styles.active}>Step 1</li>
    //           <li class={styles.active}>Step 2</li>
    //           <li class={styles.active}>Step 3</li>
    //           <li  >Step 4</li>
    //           <li >Step 5</li>
    //         </ul>
    //       </div>
    //     </div> */}
    </div>
  );
};

export default Bar;