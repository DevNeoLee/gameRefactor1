
export default function NeverStartedGames ({ data }) {
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
                    </div>
                ))
            }
        </div>
    )
}