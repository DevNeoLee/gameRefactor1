import { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useAppContext } from '../../AppContext';
import styles from './postIt.module.css';
import CaseLLVN from './CaseLLVN';
import CaseHLRN from './CaseHLRN';
import CaseLLRN from './CaseLLRN';
import CaseHLVN from './CaseHLVN';

function NearMissNotification({ stepTimer, ...commonProps  }) {
    const { nm } = useAppContext();

    // Map nm values to case numbers
    const getCaseNumber = (nmValue) => {
        switch(nmValue) {
            case 'LLVN': return 1;
            case 'HLRN': return 2;
            case 'LLRN': return 3;
            case 'HLVN': return 4;
            default: return 1; // Default case
        }
    };

    const caseNumber = getCaseNumber(nm);

    // 케이스에 따라 다른 컴포넌트 렌더링
    const renderCaseComponent = () => {
        switch(caseNumber) {
            case 1:
                return <CaseLLVN />;
            case 2:
                return <CaseHLRN />;
            case 3:
                return <CaseLLRN />;
            case 4:
                return <CaseHLVN />;
            default:
                return <CaseLLVN />;
        }
    };

    return (
        <>
            <div style={{ 
                position: 'fixed', 
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "black",
                zIndex: "2000",
                overflow: "hidden",
            }}>
                {renderCaseComponent()}
            </div>
            
            {/* Timer display - only show when backend starts the timer */}
            {stepTimer && stepTimer.step === 'nearMissNotification' && stepTimer.secondsLeft !== null && (
                <div style={{
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255,255,255,0.95)',
                    color: '#0000c4',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    padding: '0.7rem 0',
                    zIndex: 2001,
                    letterSpacing: '2px',
                    borderTop: '2px solid #0000c4',
                }}>
                    Time remaining: <span style={{ color: '#0000c4', fontWeight: 900, fontSize: '1.5rem', width: '350px'}}>{stepTimer.secondsLeft} second<span style={{ color: '#0000c4', fontWeight: 900, fontSize: '1.5rem', }}>{stepTimer.secondsLeft === 1 ? " " : "s"}</span></span> 
                </div>
            )}
        </>
    );
}

export default NearMissNotification;