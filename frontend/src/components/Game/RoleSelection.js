import { PersonCircle } from 'react-bootstrap-icons';

export default function RoleSelection({role}) {
  return (
    <div style={{ position: "absolute", left: "0", top: "0", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw"}}>
        <div>
            <div style={{ textAlign: "center", marginBottom: "40px"}}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '150px',
                    height: '150px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    border: '2px solid #0000c4',
                    margin: '0 auto',
                    boxShadow: '0 4px 8px rgba(0, 0, 196, 0.1)'
                }}>
                    <PersonCircle 
                        size={140} 
                        color="darkblue"
                    />
                </div>
            </div>

            <p style={{ textAlign: "center", fontSize: "36px"}}>You are randomly selected as <span style={{ fontSize: "36px", color: "#0000c4", marginRight: "4px", marginLeft: "2px"}}>{role.replace(/.{8}/g, "$&" + " ")}</span> in your group.</p>
            <p style={{ textAlign: "center", fontSize: "42px", marginTop: "50px"}}>You are <span style={{ fontSize: "42px", color: "#0000c4", marginRight: "4px", marginLeft: "2px"}}>{role.replace(/.{8}/g, "$&" + " ")}</span>.</p>

        </div>
    </div>
  )
}
