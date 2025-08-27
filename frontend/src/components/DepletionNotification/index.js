import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

function DepletionNotification({message}) {
    const [count, setCount] = useState(10)

    useEffect(() => {
        let waitCount = setInterval(() => {
            setCount(prev => {
                if (prev > 0) {
            
                    return prev - 1;
                } else {
    
                    clearInterval(waitCount);
                    return 0;
                }
            });
        }, 1000);

        return () => clearInterval(waitCount)
    }, [])

  return (
    <Card style={{ letterSpacing: "1px", width: '55rem', height: "26rem", position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: "2000"}}>
      <Card.Header>
        <Card.Title style={{ textAlign: "center"}}>Water Depleted!</Card.Title>
      </Card.Header>
      <Card.Body style={{ fontSize: "1.2rem", width: "100%", height: "100%"}}>
        <div style={{ width: "100%", height: "85%", display: "flex"}}>
            <div style={{ width: "60%"}}>
                <img src="/depletionGraph.png"  width="400px"/>
            </div>
            <div style={{ width: "40%"}}>
                <div style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "1rem 1rem", lineHeight: "1.8"}}>The remaining groundwater is below the critical level of depletion (15 units).</div>
                <div style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "1rem 1rem 0 1rem", lineHeight: "1.8" }}>So, this exercise ENDED without moving to the next round.</div>
            </div>
        </div>
        <div style={{ padding: "0.7rem 1rem", fontSize: "1.2rem", width: "100%", textAlign: "center", height: "15%"}}><span style={{ fontSize: "1.5rem", color: "#0000c4", margin: "1rem 1rem"}}>{count}</span>{count > 1 ? "seconds" : "second"}</div>
      </Card.Body>
    </Card>
  );
}

export default DepletionNotification;