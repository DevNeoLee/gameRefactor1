
export default function GamesStartedDroppedBeforePractices ({ data }) {
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
                                        <p>M Turk Code: {participant.mTurkcode}</p>
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
