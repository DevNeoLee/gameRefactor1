import { useState, useEffect, useContext } from 'react';
import {Link} from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';

import { Table, Form, Row, Spinner, Badge, Modal, Button } from 'react-bootstrap';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import styles from './decisionresult.module.css';
import { GameContext } from '../../pages/Game'

import Radio from '../Radio';

import { BarChart, Bar, Cell, Label, ComposedChart, Area,LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Rectangle } from 'recharts';
import { useAppContext } from '../../AppContext'; 
import PracticeNotification from '../PracticeNotification';
import { ChevronRight, House, FaCoffee, Water } from 'react-bootstrap-icons';

// Add this style object near the top of the component
const headerCellStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold"
};

const decisionHeaderStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    border: "3px solid black",
    borderLeft: "3px solid black",
    borderRight: "3px solid black",
    borderBottom: "2px solid black"
};

const resultHeaderStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    border: "3px solid black",
    borderLeft: "3px solid black",
    borderRight: "3px solid black",
    borderBottom: "2px solid black"
};

const villagerHeaderStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    borderRight: "3px solid black",
    borderTop: "none",
    borderBottom: "none"
};

const villagerCellStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    borderRight: "3px solid black",
    borderTop: "none",
    borderBottom: "none"
};

const decisionSubHeaderStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    borderLeft: "2px solid black",
    borderRight: "2px solid black",
    borderBottom: "1px solid black"
};

const resultSubHeaderStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    borderLeft: "2px solid black",
    borderRight: "2px solid black",
    borderBottom: "1px solid black"
};

const lastDecisionSubHeaderStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    borderLeft: "2px solid black",
    borderRight: "3px solid black",
    borderBottom: "1px solid black"
};

const firstResultSubHeaderStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    borderLeft: "3px solid black",
    borderRight: "2px solid black",
    borderBottom: "1px solid black"
};

const lastResultSubHeaderStyle = {
    textAlign: "center",
    verticalAlign: "middle",
    padding: "6px 4px",
    backgroundColor: "lightgray",
    fontSize: "16px",
    fontWeight: "bold",
    borderLeft: "2px solid black",
    borderRight: "3px solid black",
    borderBottom: "1px solid black"
};

export const VillagersDecision = () => {
    const {variation, session, setSession, setVariation} = useAppContext();
    const { role, gameState, setGameState, choice, setChoice, socket, currentRound, choiceList} = useContext(GameContext);
    const [hovered, setHovered] = useState('');

    // Helper for role display
    const villagerNum = role && role.match(/\d+/) ? role.match(/\d+/)[0] : '?';

    // Radio logic
    const handleFarRadio = () => setChoice('0');
    const handleNearRadio = (val) => setChoice(val);


    return (
        <div className={styles.main}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <span style={{ fontSize: 20 }}>
                    You have 10 tokens. Choose how to allocate them to build your wealth and increase your earnings.
                </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative', minHeight: 320 }}>
                {/* Far from river box */}
                <div
                    className={styles.roundedBox + (hovered === 'far' ? ' ' + styles.roundedBoxGlow : '')}
                    style={{ width: 380, minHeight: 120, marginRight: 50, borderColor: '#ccc', borderWidth: 1, borderStyle: 'solid' }}
                    onMouseEnter={() => setHovered('far')}
                    onMouseLeave={() => setHovered('')}
                    onClick={handleFarRadio}
                >
                    <div className={styles.boldText + ' '} style={{ textAlign: "center", fontSize: 20, marginBottom: 8 }}>
                        Build my wealth far from the river
                    </div>
                    <div style={{ display: 'flex', marginBottom: 8 }}>
                        <div style={{ width: '200px'}}>Allocate all tokens to the far area</div>
                        <label style={{ marginBottom: 8, width: '150px'}}>
                            <div style={{ marginLeft: 30}}>
                                <Radio
                                    handleChange={handleFarRadio}
                                    checked={choice === '0'}
                                    name="far"
                                    id="far"
                                    value="0"
                                    
                                />
                            </div>
                            <span style={{ marginLeft: 8 }}>10 tokens</span>
                        </label>
                    </div>
                </div>
                {/* Dotted line */}
                <div className={styles.dottedVertical}></div>
                {/* Near river box */}
                <div
                    className={styles.roundedBox + (hovered === 'near' ? ' ' + styles.roundedBoxGlow : '')}
                    style={{ width: 600, minHeight: 180, marginLeft: 30, borderColor: '#ccc', borderWidth: 1, borderStyle: 'solid', position: 'relative' }}
                    onMouseEnter={() => setHovered('near')}
                    onMouseLeave={() => setHovered('')}
                >
                    <div className={styles.boldText} style={{ fontSize: 20, marginBottom: 8, textAlign: 'center' }}>
                        Build my wealth near the river
                    </div>
                    <div style={{ display: 'flex'}}>
                        <div style={{ marginBottom: 6, width: '150px' }}>Contribute to public levee</div>
                        <div style={{ textAlign: "center"}}>
                            <div className={styles.tokenRadioRow}>
                                {[...Array(10)].map((_, i) => (
                                    <label key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 8px', margin: '0' }}>
                                        <Radio
                                            handleChange={() => handleNearRadio(String(i + 1))}
                                            checked={choice === String(i + 1)}
                                            name="near"
                                            id={`near${i + 1}`}
                                            value={String(i + 1)}
                                        />
                                        <span style={{ fontSize: 15 }}>{i + 1}</span>
                                    </label>
                                ))}
                            </div>
                            <div style={{ marginLeft: 8, textAlign: "center", fontSize: "14px"}}>token<span style={{ fontSize: "14px"}}>{choice == 1 ? "": 's'}</span></div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', marginTop: 2}}>
                        <div style={{ width: "120px"}}>Contribute to private wealth</div>
                            <div className={styles.tokenCalc}>
                                {choice && choice != 0 ? (
                                    <div style={{ fontSize: "18px"}}>  
                                        {10 - Number(choice)}  <span>token</span>{choice == 9 ? "": <span>s</span>} <span>( = 10 - </span><span style={{ color: 'blue', fontWeight: 'bold' }}>{choice}</span> )
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
            </div>
            {/* Visuals and labels */}
            <div style={{ position: 'absolute', marginTop: 0, bottom: 0, zIndex: -5}}>
                <img src="/mainFlood.png" width="100%" alt="flood diagram" />
                <div className={styles.zoneFarLabel} style={{ color: '#555', fontWeight: 'bold', left: 180 }}>Far from River</div>
                <div className={styles.zoneNearLabel} style={{ color: '#555', fontWeight: 'bold', left: 750, bottom: 8 }}>Near River</div>
                <div className={styles.leveeLabel} style={{ color: '#fff', fontWeight: 'bold', right: 0, bottom: 4 }}>Public Levee</div>
                <div className={styles.riverLabel} style={{ color: '#fff', fontWeight: 'bold', bottom: -2, right: -120 }}>River</div>
            </div>

        </div>
    );
}

export const Result = ({showPracticeEndNotification, practiceEndDuration}) => {
    const {variation, session, setSession, setVariation} = useAppContext();
    const { waterHeight, leveeHeight, leveeStock, role, gameState, setGameState, choice, setChoice, choiceList, floodLoss, currentRound, extraScores, showFinalResultTable, setShowFinalResultTable} = useContext(GameContext);
    const [tokensAllocated, setTokensAllocated] = useState([{user1: null}, {user2: null}, {user3: null}, {user4: null}, {provider: null}])

    const [pv, setPv] = useState(0);
    const [recharge, setRecharge] = useState(0);

    const allChoicesMade = choiceList?.every(c => c.choice !== undefined && c.choice !== null);
        
    useEffect(() => {
        if (floodLoss) {
    
            setPv(floodLoss)
            setRecharge(5);
        }
    }, [floodLoss])

    useEffect(() => {
        setPv(0)
        setRecharge(0)
    }, [currentRound])

    // Add logging for waterHeight and leveeHeight
    useEffect(() => {

    }, [waterHeight, leveeHeight]);

    const data = [
        {
          name: 'Levee Height',
          uv: 0,
          line: 25,
          pv: 50,
          amt: 40,
        },
        {
          name: 'River Height',
          uv: 0,
          pv: 0,
          line: 40, 
          amt: 60,
        }
      ];

      const popoverLeveeHeight = (
        <Popover id="popover-basic">
          <Popover.Header as="h3">Levee Height</Popover.Header>
          <Popover.Body>
            <div style={{ textAlign: "center", width: "100%" }}>
                {leveeHeight ? `${leveeHeight} ft.` : ""}
            </div>          
        </Popover.Body>
        </Popover>
      );

      const popoverRiverHeight = (
        <Popover id="popover-basic">
          <Popover.Header as="h3">River Height
          </Popover.Header>
          <Popover.Body>
          <div style={{ textAlign: "center", width: "100%" }}>
            {waterHeight ? `${waterHeight} ft.` : ""}
        </div>
          </Popover.Body>
        </Popover>
      );

      const villagerStatusPopover = (
        <Popover id="popover-basic">
          <Popover.Header as="h3">Villager Status Popover header</Popover.Header>
          <Popover.Body>
          villagerStatusPopover
          </Popover.Body>
        </Popover>
      );

    const VillagerRow = ({ villagerIndex, role, choiceList, floodLoss }) => {
        const isCurrentUser = role === `Villager${villagerIndex + 1}`;
        const villagerData = choiceList?.[villagerIndex];
        const allChoicesMade = choiceList?.every(c => c.choice !== undefined && c.choice !== null);
        const isLastRow = villagerIndex === 4; // 마지막 행인지 확인
        
        const rowStyle = {
            fontSize: "18px",
            border: isCurrentUser ? "3px solid #0000c4" : "null",
            borderTop: isCurrentUser ? "3px solid #0000c4" : "null",
            color: isCurrentUser ? "#0000c4" : undefined
        };

        const cellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d"
        };

        const villagerCellStyle = {
            textAlign: "center",
            verticalAlign: "middle",
            padding: "6px 4px",
            backgroundColor: "lightgray",
            fontSize: "16px",
            fontWeight: "bold",
            borderRight: "3px solid black"
        };

        const decisionCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "2px solid black",
            borderRight: "2px solid black"
        };

        const resultCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "2px solid black",
            borderRight: "2px solid black"
        };

        const lastDecisionCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "2px solid black",
            borderRight: "3px solid black"
        };

        const firstResultCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "3px solid black",
            borderRight: "2px solid black"
        };

        const lastResultCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "2px solid black",
            borderRight: "3px solid black"
        };

        const bottomDecisionCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "2px solid black",
            borderRight: "2px solid black",
            borderBottom: "3px solid black"
        };

        const bottomLastDecisionCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "2px solid black",
            borderRight: "3px solid black",
            borderBottom: "3px solid black"
        };

        const bottomFirstResultCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "3px solid black",
            borderRight: "2px solid black",
            borderBottom: "3px solid black"
        };

        const bottomResultCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "2px solid black",
            borderRight: "2px solid black",
            borderBottom: "3px solid black"
        };

        const bottomLastResultCellStyle = {
            fontSize: "18px",
            fontWeight: isCurrentUser ? "600" : null,
            color: isCurrentUser ? "#0000c4" : "#3d3d3d",
            borderLeft: "2px solid black",
            borderRight: "3px solid black",
            borderBottom: "3px solid black"
        };

        const centeredContainerStyle = {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            minHeight: "40px"
        };

        const textOneLineStyle = {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100px",
            height: "100%",
            minHeight: "40px"
        };

        const renderValue = (value, suffix = "", showSpinner = true) => {
            if (value === undefined && showSpinner) {
                return <div style={centeredContainerStyle}><Spinner animation="border" size="sm" variant="dark" /></div>;
            }
            return (
                <div style={centeredContainerStyle}>
                    <span style={{ fontSize: "24px", fontWeight: "500" }}>{value}</span>
                    {suffix && <span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px" }}>{suffix}</span>}
                </div>
            );
        };

        const renderTokens = (value) => {
            if (!value && value !== 0) return renderValue(undefined);
            const suffix = value > 1 ? "tokens" : "token";
            return renderValue(value, suffix);
        };

        return (
            <tr style={rowStyle}>
                <td style={villagerCellStyle}>
                    <div className={styles.villagerContainer} style={textOneLineStyle}>
                        Villager {villagerIndex + 1}
                        {isCurrentUser && <span className={styles.villagerContainerRole2}> (You)</span>}
                    </div>
                </td>
                <td style={isLastRow ? bottomDecisionCellStyle : decisionCellStyle}>
                    <div className={styles.noticibleContainer} style={cellStyle}>
                        {villagerData?.choice ? (
                            <div style={textOneLineStyle}>
                                {villagerData.choice == 0 ? 'Far from river' : 'Near river'}
                            </div>
                        ) : renderValue(undefined)}
                    </div>
                </td>
                <td style={isLastRow ? bottomDecisionCellStyle : decisionCellStyle}>
                    <div className={styles.noticibleContainer} style={cellStyle}>
                        {villagerData?.choice ? (
                            villagerData.choice == 0 ? (
                                renderValue('NA')
                            ) : renderTokens(villagerData.choice)
                        ) : (
                            <div style={centeredContainerStyle}>
                                <Badge pill bg="dark" text="light">waiting</Badge>
                            </div>
                        )}
                    </div>
                </td>
                <td style={isLastRow ? bottomLastDecisionCellStyle : lastDecisionCellStyle}>
                    <div className={styles.noticibleContainer} style={cellStyle}>
                        {villagerData?.choice ? (
                            villagerData.choice == 0 ? (
                                renderValue('NA')
                            ) : renderTokens(10 - villagerData.choice)
                        ) : renderValue(undefined)}
                    </div>
                </td>
                <td style={isLastRow ? bottomFirstResultCellStyle : firstResultCellStyle}>
                    <div className={styles.noticibleContainer} style={cellStyle}>
                        {allChoicesMade && (floodLoss || floodLoss === 0) && 
                         (villagerData?.earningBeforeLoss || villagerData?.earningBeforeLoss === 0) ? (
                            renderTokens(villagerData.earningBeforeLoss)
                        ) : renderValue(undefined)}
                    </div>
                </td>
                <td style={isLastRow ? bottomResultCellStyle : resultCellStyle}>
                    <div className={styles.noticibleContainer} style={cellStyle}>
                        {allChoicesMade && (floodLoss || floodLoss === 0) ? (
                            villagerData.choice == 0 ?
                            <div style={centeredContainerStyle}>
                                <span style={{ fontSize: "24px", fontWeight: "500" }}>0</span>
                                <span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px" }}>%</span>
                            </div>
                            :
                            renderValue(floodLoss, "%")
                        ) : renderValue(undefined)}
                    </div>
                </td>
                <td style={isLastRow ? bottomLastResultCellStyle : lastResultCellStyle}>
                    <div className={styles.noticibleContainer} style={cellStyle}>
                        {allChoicesMade && (floodLoss || floodLoss === 0) && 
                         (villagerData?.earningAfterLoss || villagerData?.earningAfterLoss === 0) ? (
                            renderTokens(villagerData.earningAfterLoss)
                        ) : renderValue(undefined)}
                    </div>
                </td>
            </tr>
        );
    };

    const [showLeveeModal, setShowLeveeModal] = useState(false);
    const [showFloodModal, setShowFloodModal] = useState(false);

    const handleLeveeOpen = (e) => { e.preventDefault(); setShowLeveeModal(true); };
    const handleLeveeClose = () => setShowLeveeModal(false);

    const handleFloodOpen = (e) => { e.preventDefault(); setShowFloodModal(true); };
    const handleFloodClose = () => setShowFloodModal(false);

    return (
        <div className={styles.mainResult}>
            <div className={styles.hoverSuggestion}>
                <p>1. The more the river height exceeds the levee height, the greater the flood loss.</p>
                <p>2. At the end of each round, levee stock naturally decreases by 25 tokens, reducing levee height accordingly (but not below the minimum threshold of 30 tokens).</p>
            </div>
            <div className={styles.left}>
                <div className={styles.leftInside}>
                    <div className={styles.graphTitle}>
                        {allChoicesMade && <h2>Levee Height vs. Peak River Height </h2>}
                    </div>
                    {/* levee Height */}
                    {
                        allChoicesMade &&
                        <>
                            <OverlayTrigger trigger={['hover', 'focus']}  placement="bottom" overlay={popoverLeveeHeight} style={{ zIndex: "30013"}}>
                                <div style={{ 
                                    color: "white", height: leveeHeight ? `calc(${ leveeHeight * 11.5 }px)` : 0, backgroundColor: "#cc7923", width: "220px", bottom: "26px", left: "60px", position: "absolute", zIndex: "1000", transition: "500ms"
                                }}>
                                    {
                                        leveeHeight < 6 
                                        ?
                                        <div style={{ color: "#212121ff", textAlign: "center", position: "absolute", bottom: "26px", left: "30px", zIndex: "1002"}}>
                                            <div>
                                                <div style={{ fontSize: "1.4rem"}}>
                                                    {leveeHeight}{leveeHeight > 0 ? " ft.": ""}
                                                </div>
                                                <div style={{ fontSize: "1.4rem"}}>
                                                    <span>(Levee Stock: <span style={{ fontSize: "1.4rem"}}>{leveeStock}</span> tokens)</span>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div style={{ textAlign: "center", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                            <div>
                                                <div style={{ fontSize: "1.4rem"}}>
                                                    {leveeHeight}{leveeHeight > 0 ? " ft.": ""}
                                                </div>
                                                <div style={{ fontSize: "1.4rem"}}>
                                                    <span>(Levee Stock: <span style={{ fontSize: "1.4rem"}}>{leveeStock}</span> tokens)</span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                   
                                
                                </div>

                            </OverlayTrigger>
                            {/* water Height */}
                            <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" overlay={popoverRiverHeight} style={{ zIndex: "30013"}}>
                                <div style={{ 
                                    color: "white", height: waterHeight ? `calc(${ waterHeight * 11.5 }px)` : 0, backgroundColor: "#40c1ef", width: "220px", bottom: "26px", left: "280px", position: "absolute", zIndex: "1000", transition: "500ms",
                                }}> 
                                {
                                    waterHeight < 6
                                    ?
                                    <div style={{ color: "#212121ff", textAlign: "center", position: "absolute", bottom: "26px", left: "250px", zIndex: "1002"}}>
                                        <div>
                                            <div style={{ fontSize: "1.4rem"}}>
                                                {waterHeight}{waterHeight > 0 ? " ft.": ""}
                                            </div>
                                        </div>
                                    </div>
                                    :
                                     <div style={{ textAlign: "center", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                                        <div>
                                            <div style={{ fontSize: "1.4rem"}}>
                                                {waterHeight}{waterHeight > 0 ? " ft.": ""}
                                            </div>
                                        </div>
                                    </div>
                                }
                                   
                                </div>
                            </OverlayTrigger>
                            <div style={{ height: "24px"}}></div>
                            <ResponsiveContainer width="95%" height={300}>
                                <BarChart
                                width={100}
                                height={600}
                                data={data}
                                margin={{
                                    top: 20,
                                    right:0,
                                    left: 0,
                                    bottom: 20,
                                }}
                                >
                                    {/* <CartesianGrid strokeDasharray="3 3" /> */}
                                    <XAxis dataKey="name" />
                                    {/* <YAxis  domain={[0, 80]}/> */}
                                    <YAxis domain={[0, 20]} dataKey={"height"} yAxisId={"height"}>
                                        <Label
                                            style={{
                                                textAnchor: "middle",
                                                fontSize: "30px",
                                                fill: "gray",
                                            }}
                                        angle={270} 
                                        position="insideLeft"
                                        dx={15} 
                                        dy={-60}
                                        value={"Height (feet)"} />
                                        
                                    </YAxis>
                                    {/* <Bar dataKey="pv" stackId="a" fill="#2F57B8"/>
                                    <Bar dataKey="uv" stackId="a" fill="lightblue" />
                                    <Line type="monotone" dataKey="line" stroke="#0095FF" />
                                    <Area type="monotone" dataKey="pv" stroke="#82ca9d" fill="#82ca9d" /> */}
                                </BarChart>
                            </ResponsiveContainer>
                        </>
                    }
                </div>
                    {
                        allChoicesMade &&
                        <div className={styles.bottomGraph}>
                            <div className={styles.bottomGraphLeft}>
                                <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                                    <House size={52} style={{ position: "absolute", top: "325px"}}/>
                                    {floodLoss ? <Water size={52} color="blue" style={{ marginTop: "35px"}}/>: <div style={{ marginTop: "87px"}}></div>}
                                </div>
                                {<p>Near the River</p>}
                            </div>
                            <div className={styles.bottomGraphRight}>
                            { choiceList?.[0]?.earningAfterLoss || choiceList?.[0]?.earningAfterLoss == 0 ? <p>Flood Loss: <span style={{ fontSize: "22px", color: "blue"}}>{floodLoss} <span style={{ fontSize: "17px"}}>{floodLoss || floodLoss == 0 ? '%' : null}</span></span></p> : null}
                            </div>
                        </div>
                    }
            </div>
            <div className={styles.rightResultContainer}>
                <div className={styles.topbox}>
                    <Table bordered hover>
                        <thead>
                            <tr>
                                <th style={villagerHeaderStyle} rowSpan="2">Villager</th>
                                <th style={decisionHeaderStyle} colSpan="3">DECISION</th>
                                <th style={resultHeaderStyle} colSpan="3">RESULT</th>
                            </tr>
                            <tr>
                                <th style={decisionSubHeaderStyle}>Where Invested</th>
                                <th style={decisionSubHeaderStyle}>Invested in Public Levee</th>
                                <th style={lastDecisionSubHeaderStyle}>Invested in Private Wealth</th>
                                <th style={firstResultSubHeaderStyle}>Earnings BEFORE Flood Loss</th>
                                <th style={resultSubHeaderStyle}>Flood Loss</th>
                                <th style={lastResultSubHeaderStyle}>Earnings AFTER Flood Loss</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }, (_, i) => (
                                <VillagerRow
                                    key={`villager-row-${i + 1}`}
                                    villagerIndex={i}
                                    role={role}
                                    choiceList={choiceList}
                                    floodLoss={floodLoss}
                                />
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
            
            {/* Links positioned outside the main container */}
            <div style={{
                position: 'absolute',
                bottom: '-227px',
                right: '-20px',
                transform: 'translateY(-50%)',
                zIndex: 10000,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '15px',
                borderRadius: '8px',
                // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                // border: '1px solid #ddd',
                maxWidth: '300px'
            }}>
                <div style={{ marginBottom: '0px', fontWeight: 'bold', color: '#333' }}>
                    Additional Information:
                </div>
                <a
                    href="#"
                    onClick={handleLeveeOpen}
                    style={{ 
                        color: "#0065cc", 
                        fontWeight: "bold", 
                        textDecoration: "underline", 
                        display: "block", 
                        marginBottom: 8,
                        fontSize: '14px',
                        lineHeight: '1.4'
                    }}
                >
                    Click Here for "Levee Stock and Height Relation"
                </a>
                <a
                    href="#"
                    onClick={handleFloodOpen}
                    style={{ 
                        color: "#0065cc", 
                        fontWeight: "bold", 
                        textDecoration: "underline", 
                        display: "block",
                        fontSize: '14px',
                        lineHeight: '1.4'
                    }}
                >
                    Click Here for "Overtopping and Flood Loss Relation"
                </a>
            </div>
            {
                showPracticeEndNotification
                ?
                <PracticeNotification practiceEndDuration={practiceEndDuration}/>
                :
                null
            }
        <Modal show={showLeveeModal} onHide={handleLeveeClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Levee Stock and Height Relation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#3498db', color: 'white' }}>
                  <th>Levee Stock<br/>(tokens)</th>
                  <th>Levee Height<br/>(ft)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>&lt;30</td><td>0</td></tr>
                <tr><td>30 - 39</td><td>2</td></tr>
                <tr><td>40 - 49</td><td>4</td></tr>
                <tr><td>50 - 59</td><td>6</td></tr>
                <tr><td>60 - 69</td><td>8</td></tr>
                <tr><td>70 - 79</td><td>10</td></tr>
                <tr><td>80 - 89</td><td>12</td></tr>
                <tr><td>90 - 99</td><td>14</td></tr>
                <tr><td>100 - 109</td><td>16</td></tr>
                <tr><td>110 - 119</td><td>18</td></tr>
                <tr><td>&ge; 120</td><td>20</td></tr>
              </tbody>
            </table>
          </Modal.Body>
        </Modal>

        <Modal show={showFloodModal} onHide={handleFloodClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Overtopping and Flood Loss Relation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#3498db', color: 'white' }}>
                  <th>Overtopping Level<br/>(ft)</th>
                  <th>Flood Loss<br/>(%)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>0</td><td>0</td></tr>
                <tr><td>1 - 2</td><td>10</td></tr>
                <tr><td>3 - 4</td><td>30</td></tr>
                <tr><td>5 - 6</td><td>50</td></tr>
                <tr><td>7 - 8</td><td>70</td></tr>
                <tr><td>9 - 10</td><td>90</td></tr>
                <tr><td>&ge; 11</td><td>100</td></tr>
              </tbody>
            </table>
          </Modal.Body>
        </Modal>
    </div>
    );
}

export const FinalResult = ({showPracticeEndNotification, practiceEndDuration, finalScores}) => {
    const {variation, session, setSession, setVariation} = useAppContext();
    const { role, gameState, setGameState, choice, setChoice, choiceList, floodLoss, extraScores, currentRound, showFinalResultTable, setShowFinalResultTable} = useContext(GameContext);
    const [tokensAllocated, setTokensAllocated] = useState([{user1: null}, {user2: null}, {user3: null}, {user4: null}, {provider: null}])

    const [pv, setPv] = useState(0);
    const [recharge, setRecharge] = useState(0);


    useEffect(() => {
        setPv(0)
        setRecharge(0)
    }, [currentRound])

    useEffect(() => {

    }, [finalScores])

      const popoverRemainingWater = (
        <Popover id="popover-basic">
          <Popover.Header as="h3">Total Available Water</Popover.Header>
          <Popover.Body>
            {gameState.previousWater} tokens
          </Popover.Body>
        </Popover>
      );

    //   const rechargedCurrentWaterBase = (
    //     <Popover id="popover-basic">
    //       <Popover.Header as="h3">Water Left after Usage</Popover.Header>
    //       <Popover.Body>
    //         {gameState.previousWater - floodLoss} tokens
    //       </Popover.Body>
    //     </Popover>
    //   );

      const rechargeWater = (
        <Popover id="popover-basic">
          <Popover.Header as="h3">Water Recharge</Popover.Header>
          <Popover.Body>
            5 tokens
          </Popover.Body>
        </Popover>
      );

    return (
        <div style={{ padding: "0 3rem"}}>
            <div style={{ textAlign: "center"}}>
                <Table bordered hover>
                    <thead>
                        <tr style={{ fontSize: "18px", backgroundColor: "lightblue"}}>
                            <th style={{ backgroundColor: "lightgray"}}>Villager</th>
                            <th style={{ backgroundColor: "lightgray"}}>Earnings<span style={{ fontSize: "14px"}}>( from crops )</span></th>
                            <th style={{ backgroundColor: "lightgray"}}>Extra Earnings <span style={{ fontSize: "14px"}}>( from remaining ground water )</span></th>
                            <th style={{ backgroundColor: "lightgray"}}>Total Earnings <span style={{ fontSize: "14px"}}></span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{fontSize: "18px", border: role == "Villager1"  ? "3px solid #0000c4" : "null", borderTop: role == "Villager1" ? "3px solid #0000c4" : "null"}}>
                            <td >
                                <div className={styles.villagerContainer}>
                                    Villager 1{role == "Villager1" ? <span className={styles.villagerContainerRole2}> (You)</span>: null}
                                </div>
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontSize: "18px",  fontWeight: role == "Villager1" ? "600" : null, color: role == "Villager1" ? " #0000c4" : "#3d3d3d"}}>{finalScores?.[0] ? <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{finalScores?.[0]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontSize: "18px",  fontWeight: role == "Villager1" ? "600" : null, color: role == "Villager1" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[0] ? <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{extraScores?.[0]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager1" ? "600" : null, color: role == "Villager1" ? " #0000c4" : "#3d3d3d"}}>{floodLoss ? floodLoss : ""}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>%</span></div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager1" ? "600" : null, color: role == "Villager1" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[0] && finalScores[0] ? extraScores?.[0] + finalScores?.[0] : finalScores?.[0]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> 
                            </td>
                        </tr>

                        <tr style={{border: role == "Villager2"  ? "3px solid #0000c4" : "null", borderTop: role == "Villager2" ? "3px solid #0000c4" : "null", color: "#0000c4"}}>
                            <td >
                                <div className={styles.villagerContainer}>
                                Villager 2{role == "Villager2" ? <span className={styles.villagerContainerRole2}> (You)</span>: null}
                                </div>
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager2" ? "600" : null, color: role == "Villager2" ? " #0000c4" : "#3d3d3d"}}>{finalScores?.[1] ? <div style={{ fontSize: "24px", fontWeight: role == "Villager2" ? "600" : null, width: "100%", textAlign: "center"}}>{finalScores?.[1]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager2" ? "600" : null, color: role == "Villager2" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[1] ? <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{extraScores?.[1]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager1" ? "600" : null, color: role == "Villager1" ? " #0000c4" : "#3d3d3d"}}>{floodLoss ? floodLoss : ""}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>%</span></div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager2" ? "600" : null, color: role == "Villager2" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[1] && finalScores[1] ? extraScores?.[1] + finalScores?.[1] : finalScores?.[1]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> 
                            </td>
                        </tr>
                
                        <tr style={{border: role == "Villager3"  ? "3px solid #0000c4" : "null", borderTop: role == "Villager3" ? "3px solid #0000c4" : "null"}}>
                            <td >                                
                                <div className={styles.villagerContainer}>
                                Villager 3{role == "Villager3" ? <span className={styles.villagerContainerRole2}> (You)</span>: null}
                                </div>
                            </td>
                            <td >        
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager3" ? "600" : null, color: role == "Villager3" ? " #0000c4" : "#3d3d3d"}}>{finalScores?.[2] ? <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{finalScores?.[2]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >        
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager3" ? "600" : null, color: role == "Villager3" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[2] ?  <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{extraScores?.[2]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager1" ? "600" : null, color: role == "Villager1" ? " #0000c4" : "#3d3d3d"}}>{floodLoss ? floodLoss : ""}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>%</span></div> 
                            </td>
                            <td >        
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager3" ? "600" : null, color: role == "Villager3" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[2] && finalScores[2] ? extraScores?.[2] + finalScores?.[2] : finalScores?.[2]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> 
                            </td>
                        </tr>
                        
                        <tr style={{border: role == "Villager4"  ? "3px solid #0000c4" : "null", borderTop: role == "Villager4" ? "3px solid #0000c4" : "null"}}>
                            <td >        
                                <div className={styles.villagerContainer}>
                                Villager 4{role == "Villager4" ? <span className={styles.villagerContainerRole2} > (You)</span>: null}
                                </div>
                            </td>
                            <td >      
                                <div className={styles.noticibleContainer} style={{fontWeight: role == "Villager4" ? "600" : null,  color: role == "Villager4" ? " #0000c4" : "#3d3d3d"}}>{finalScores?.[3] ? <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{finalScores?.[3]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >      
                                <div className={styles.noticibleContainer} style={{fontWeight: role == "Villager4" ? "600" : null,  color: role == "Villager4" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[3] ? <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{extraScores?.[3]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager1" ? "600" : null, color: role == "Villager1" ? " #0000c4" : "#3d3d3d"}}>{floodLoss ? floodLoss : ""}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>%</span></div> 
                            </td>
                            <td >      
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager4" ? "600" : null, color: role == "Villager4" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[3] && finalScores[3] ? extraScores?.[3] + finalScores?.[3] : finalScores?.[3]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> 
                            </td>
                        </tr>

                        <tr style={{border: role == "Villager5"  ? "3px solid #0000c4" : "null", borderTop: role == "Villager5" ? "3px solid #0000c4" : "null"}}>
                            <td >      
                                <div className={styles.villagerContainer}>
                                Villager 5{role == "Villager5" ? <span className={styles.villagerContainerRole2}> (You)</span>: null}
                                </div>
                            </td>
                            <td >   
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager5" ? "600" : null, color: role == "Villager5" ? " #0000c4" :"#3d3d3d"}}>{finalScores?.[4] ? <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{finalScores?.[4]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >   
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager5" ? "600" : null, color: role == "Villager5" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[4] ? <div style={{ fontSize: "24px", width: "100%", textAlign: "center"}}>{extraScores?.[4]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> : <div style={{ width: "100%", fontSize: "24px", textAlign: "center"}}>0<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>token</span></div>}</div> 
                            </td>
                            <td >
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager1" ? "600" : null, color: role == "Villager1" ? " #0000c4" : "#3d3d3d"}}>{floodLoss ? floodLoss : ""}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>%</span></div> 
                            </td>
                            <td >   
                                <div className={styles.noticibleContainer} style={{ fontWeight: role == "Villager5" ? "600" : null, color: role == "Villager5" ? " #0000c4" : "#3d3d3d"}}>{extraScores?.[4] && finalScores[4] ? extraScores?.[4] + finalScores?.[4] : finalScores[4]}<span style={{ fontSize: "0.9rem", marginLeft: "3px", marginTop: "3px"}}>tokens</span></div> 
                            </td>
                        </tr>

                    </tbody>
                </Table>
            </div>
        </div>
    );
}
