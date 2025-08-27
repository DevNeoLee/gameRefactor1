import { Card } from 'react-bootstrap';

function PracticeNotification({ practiceEndDuration}) {
  return (
    <Card style={{ letterSpacing: "1px", width: '55rem', height: "23rem", position: 'fixed', top: '48%', left: '50%', transform: 'translate(-48%, -50%)', zIndex: "2000", paddingTop: "38px"}}>
      {/* <Card.Header>
        <Card.Title style={{ textAlign: "center"}}>Practice rounds are now finished</Card.Title>
      </Card.Header> */}
      <Card.Body style={{ fontSize: "1.2rem", width: "100%", height: "100%"}}>
        <div style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "1rem 3rem", textAlign: "center", lineHeight: "2" }}><span style={{fontSize: "1.2rem", fontWeight: "bold", marginRight: "6px"}}>Practice rounds</span> are now finished. Great job!</div>
        <div style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "0.8rem 3rem", textAlign: "center", lineHeight: "2" }}>You are now ready to play <span style={{fontSize: "1.2rem", fontWeight: "bold", marginLeft: "6px"}}> actual rounds to earn money.</span></div>
        <div style={{ padding: "2rem 1rem", fontSize: "1.2rem", width: "100%", textAlign: "center", letterSpacing: "2px"}}> Starts in <span style={{ fontSize: "1.7rem", color: "#0000c4", margin: "1rem 1rem"}}>{practiceEndDuration}</span>{practiceEndDuration > 1 ? "seconds" : "second"}</div>
      </Card.Body>
    </Card>
  );
}

export default PracticeNotification;