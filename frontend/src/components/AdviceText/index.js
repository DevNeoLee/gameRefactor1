import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

function AdviceText({message}) {
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
    <div style={{ 
      position: 'fixed', 
      top: '48%', 
      left: '50%', 
      transform: 'translate(-48%, -50%)', 
      width: '55rem', 
      height: '23rem',
      zIndex: '2000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img 
        src="/oldPaper1.png" 
        alt="old paper" 
        style={{ 
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1
        }} 
      />
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{ 
          fontSize: '1.6rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          padding: '0.8rem 0',
          fontFamily: "'IM Fell English', serif",
          color: '#2a2a2a',
          fontWeight: '400',
          letterSpacing: '0.5px',
          fontStyle: 'italic'
        }}>
          This is a Advice Text.
        </div>
        <div style={{ 
          fontSize: '1.6rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          padding: '1rem 3rem', 
          textAlign: 'center', 
          lineHeight: '2',
          fontFamily: "'IM Fell English', serif",
          color: '#2a2a2a',
          fontWeight: '400',
          letterSpacing: '0.5px',
          fontStyle: 'italic'
        }}>
          This is a Advice Text.
        </div>
        <div style={{ 
          fontSize: '1.6rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          padding: '0.8rem 3rem', 
          textAlign: 'center', 
          lineHeight: '2',
          fontFamily: "'IM Fell English', serif",
          color: '#2a2a2a',
          fontWeight: '400',
          letterSpacing: '0.5px',
          fontStyle: 'italic'
        }}>
          This is a Advice Text.
        </div>

        <div style={{ 
          padding: '2rem 1rem', 
          fontSize: '1.2rem', 
          width: '100%', 
          textAlign: 'center', 
          letterSpacing: '1px',
          fontFamily: "'Crimson Text', serif",
          color: '#2a2a2a'
        }}> 
          Starts in <span style={{ 
            fontSize: '2.2rem', 
            color: '#0000c4', 
            margin: '1rem 1rem',
            fontFamily: "'IM Fell English SC', serif",
            fontWeight: '400'
          }}>{count}</span>{count > 1 ? "seconds" : "second"}
        </div>
      </div>
    </div>
  );
}

export default AdviceText;