import {CheckCircleFill} from 'react-bootstrap-icons'

export default function ParticipantsReady() {
  return (
    <div style={{ position: "absolute", left: "0", top: "0", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", color: "white", backgroundColor: "darkGray"}}>
        <div>
            <div style={{ textAlign: "center", marginBottom: "30px"}}><CheckCircleFill color={"green"} size={80}/></div>
            <p style={{ textAlign: "center", fontSize: "28px"}}>Your group is successfully formed!</p>
            <p style={{ textAlign: "center", fontSize: "24px"}}>Please wait. You will be re-directed shortly.</p>
        </div>
    </div>
  )
}
