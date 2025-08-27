import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  MessageGroup,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import { PersonCircle } from 'react-bootstrap-icons';
import { useState, useEffect } from "react";

// Add custom theme styles
const customTheme = `
  .cs-message--outgoing .cs-message__content {
    background-color: #4a90e2 !important;
    color: white !important;
  }
  
  .cs-message--incoming .cs-message__content {
    background-color: #f0f0f0 !important;
    color: black !important;
  }

  .cs-message-input__content-editor {
    font-size: 24px !important;
    line-height: 1 !important;
    padding: 12px 12px !important;
    height: 48px !important;
    max-height: 48px !important;
    overflow-y: auto !important;
    resize: none !important;
    display: flex !important;
    align-items: center !important;
    transition: background-color 0.2s ease !important;
    width: 100% !important;
  }

  .cs-message-input__content-editor:focus {
    background-color: #e9ecef !important;
    outline: none !important;
  }

  .cs-message-input__content-editor:hover {
    background-color: #f1f3f5 !important;
  }

  .cs-message-input__content-editor-wrapper {
    padding: 0 !important;
    height: 48px !important;
    max-height: 48px !important;
    display: flex !important;
    align-items: center !important;
    width: 100% !important;
  }

  .cs-message-input__content-editor-container {
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
    background-color: #f8f9fa !important;
    border-radius: 8px !important;
    display: flex !important;
    align-items: center !important;
    transition: background-color 0.2s ease !important;
    width: 100% !important;
  }

  .cs-message-input__content-editor-container:hover {
    background-color: #f1f3f5 !important;
  }

  .cs-message-input {
    padding: 8px 16px !important;
    background-color: white !important;
    border-top: 1px solid #e9ecef !important;
    height: 64px !important;
    min-height: 64px !important;
    max-height: 64px !important;
    width: 100% !important;
  }

  .cs-message-input__content-editor[data-placeholder]:empty:before {
    color: #adb5bd !important;
    font-size: 24px !important;
    line-height: 1 !important;
    padding: 12px 12px !important;
    display: flex !important;
    align-items: center !important;
  }

  .cs-message-input__tools {
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
    display: flex !important;
    align-items: center !important;
  }

  .cs-message-input__tool {
    width: 48px !important;
    height: 48px !important;
    min-width: 48px !important;
    min-height: 48px !important;
    cursor: pointer !important;
    transition: background-color 0.2s ease !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .cs-message-input__tool:hover {
    background-color: #f1f3f5 !important;
    border-radius: 50% !important;
  }

  .cs-message-input__tool svg {
    width: 28px !important;
    height: 28px !important;
  }

  .cs-typing-indicator {
    padding: 8px 16px !important;
    margin-bottom: 8px !important;
  }
`;

// Timer component
const Timer = ({ seconds }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #bbb',
      marginTop: '4px'
    }}>
      <div style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: seconds < 30 ? '#dc3545' : '#28a745',
        fontFamily: 'monospace'
      }}>
        {minutes.toString().padStart(2, '0')}:{remainingSeconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
};

export default function ChattingRoom({ socket, role, gameState, onNext }) {
  // console.log('ChattingRoom component rendering with props:', {
  //   socket: !!socket,
  //   role,
  //   gameState,
  //   onNext: !!onNext
  // });

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);

  useEffect(() => {
    // console.log('ChattingRoom useEffect triggered');
    // console.log('Current props:', {
    //   socket: !!socket,
    //   roomName: gameState?.roomName,
    //   role
    // });

    if (!socket) {
      
      return;
    }

    if (!gameState?.roomName) {
      
      return;
    }

    // console.log('Starting chat phase for room:', gameState.roomName);
    // Request chat phase start from backend
    socket.emit('startChatPhase', { roomName: gameState.roomName });

    // Listen for chat timer updates from backend
    socket.on("chatTimer", (time) => {
      // console.log('Received chat timer update:', time);
      setRemainingTime(time);
    });

    // Listen for chat phase end
    socket.on("chatPhaseEnd", () => {
      // console.log('Chat phase ended, transitioning to next step');
      onNext(); // Move to next step based on game flow
    });

    // Listen for incoming chat messages
    socket.on("chatMessage", (msg) => {
      if (msg.socketId !== socket.id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      
      socket.off("chatMessage");
      socket.off("chatTimer");
      socket.off("chatPhaseEnd");
    };
  }, [socket, gameState?.roomName, onNext, role]);

  const handleSend = (message) => {
    const now = new Date();
    const newMessage = {
      message,
      sentTime: now.toISOString(),
      sender: role,
      socketId: socket?.id,
      direction: "outgoing",
      position: "single",
    };
    setMessages((prev) => [...prev, newMessage]);
    if (socket) {
      socket.emit("chatMessage", newMessage);
    }
  };

  const getAvatarIcon = (sender, isCurrentUser) => {
    const roleLabel = isCurrentUser ? `You (${sender})` : sender;
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        margin: isCurrentUser ? '0 0 0 16px' : '0 16px 0 0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: 'white',
          borderRadius: '50%',
          border: `2px solid ${isCurrentUser ? '#4a90e2' : '#666'}`
        }}>
          <PersonCircle 
            size={40} 
            color={isCurrentUser ? "#4a90e2" : "#666"} 
          />
        </div>
        <span style={{ 
          fontSize: '14px', 
          color: isCurrentUser ? '#4a90e2' : '#666',
          fontWeight: isCurrentUser ? 'bold' : 'normal',
          whiteSpace: 'nowrap'
        }}>
          {roleLabel}
        </span>
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#fcfcfc',}}>
      <div style={{ 
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        width: "700px",
        margin: "0 auto",
        border: "1px solid #bbb",
      }}>
        <style>{customTheme}</style>
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          padding: '16px',
          backgroundColor: '#fff3cd',
          border: '1px solid #bbb',
          margin: '0px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>⚠️ Chat Policy Reminder</div>
            <div style={{ marginLeft: '20px' }}>
              <div>1. This chat session is limited to 1 minute only</div>
              <div>2. Please do not use vulgar or offensive language</div>
              <div>3. Be respectful and maintain a friendly conversation</div>
            </div>
          </div>
        </div>

        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
        }}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator content="Emily is typing" />
                  ) : null
                }
                style={{ 
                  height: 'calc(100vh - 253px)',
                  backgroundColor: '#f8f9fa',
                }}
              >
                {messages.map((message, index) => {
                  const isCurrentUser = message.socketId === socket?.id;
                  return (
                    <MessageGroup
                      key={index}
                      direction={isCurrentUser ? "outgoing" : "incoming"}
                      sender={message.sender}
                    >
                      <MessageGroup.Messages>
                        <div style={{ 
                          display: 'flex',
                          flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                          alignItems: 'flex-start',
                          gap: '0px',
                          margin: '8px 0'
                        }}>
                          {getAvatarIcon(message.sender, isCurrentUser)}
                          <Message
                            model={{
                              message: message.message,
                              sentTime: message.sentTime,
                              sender: message.sender,
                              direction: isCurrentUser ? "outgoing" : "incoming",
                              position: message.position,
                            }}
                          />
                        </div>
                      </MessageGroup.Messages>
                    </MessageGroup>
                  );
                })}
              </MessageList>
            </ChatContainer>
          </MainContainer>

          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 0px',
            border: '1px solid #bbb',
          }}>
            <MessageInput
              placeholder="Type message here"
              onSend={handleSend}
              attachButton={false}
              sendButton={true}
              autoFocus={true}
            />
            <Timer seconds={remainingTime} />
          </div>
        </div>
      </div>
    </div>
  );
}