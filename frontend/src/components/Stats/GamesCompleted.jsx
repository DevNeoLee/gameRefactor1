
export default function GamesCompleted ({ data }) {
    // console.log('GamesCompleted data: ', data)
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/New_York',
        hour12: true, // 24-hour format
      };

    return (
        <div >
            {
                data?.map((game, id) => (
                    <div key={id} style={{ margin: "0.5rem", padding: "1rem", border: "1px solid brown", width: '550px'}}>
                        <p>Room Name: {game.roomName}</p>
                        <p>Game Type: {game.nm}</p>
                        <p>Game Room Created(Eastern) at: {new Date(game?.gameCreatedTime).toLocaleString('en-US', options)}</p>
                        <p>Game Rounds Ended(Eastern) at: {new Date(game?.gameEndTime).toLocaleString('en-US', options)}</p>
                        <p>Participants( {game.participants.length} ): </p>
                        <div>
                            {
                                game.participants.sort((a, b) => Number(a.role.slice(8)) - Number(b.role.slice(8))).map((participant, p_id) => (
                                    <div key={p_id} style={{ padding: "0.5rem", margin: "0.5rem"}}>
                                        <p>Role: <span style={{ fontSize: "1.3rem", color: "darkblue"}}>{participant.role}</span></p>
                                        <div style={{padding: "0 0.5rem", margin: "0 0.5rem"}}>
                                            <p>TotalScore from the 'rounds': {participant.totalEarnings} tokens</p>
                                            <p>M Turk Code: {participant.mTurkcode}</p>
                                            <div>
                                                {
                                                    participant.results.map((result, id) => (
                                                        <div key={id} style={{fontSize: "1.3rem", color: "darkblue", display: "flex", justifyContent: "space-around", width: "100px"}}><span style={{ fontSize: "1.2rem", color: "darkblue", marginRight: "2rem"}}>{id + 1}.</span> <span style={{ backgroundColor: "lighblue", fontSize: "1.3rem", textAlign: "right", width: "50px"}}>{result.choice}</span></div> 
                                                        )
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
