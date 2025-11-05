// import React, { useState, useRef, useEffect } from "react";
// import { API_BASE_URL } from "../config";
// import "./Chat.css";

// export default function Chat() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, loading]);

//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const newMessages = [...messages, { role: "user", content: input }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);

//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`${API_BASE_URL}/chat`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//         body: JSON.stringify({ user_query: input, history: newMessages }),
//       });

//       const data = await res.json();
//       setMessages([...newMessages, { role: "ai", content: data.ai_response }]);
//     } catch (error) {
//       setMessages([
//         ...newMessages,
//         {
//           role: "ai",
//           content:
//             "Sorry, I'm having trouble connecting right now. Please try again shortly.",
//           error: error.message,
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-header">
//         <div className="chat-title">
//           <span className="chat-icon">💬</span>
//           <h3>AI Travel Assistant</h3>
//         </div>
//         <p>Ask me anything about travel planning!</p>
//       </div>

//       <div className="chat-messages">
//         {messages.length === 0 && (
//           <div className="empty-chat">
//             <div className="empty-icon">🐨</div>
//             <h4>Hello! I'm KoalaRoute AI</h4>
//             <p>
//               I can help you with flight comparisons, hotel recommendations,
//               itinerary planning, and more!
//             </p>
//             <div className="suggestion-chips">
//               <button onClick={() => setInput("Find flights to Paris")}>
//                 Find flights to Paris
//               </button>
//               <button onClick={() => setInput("Best hotels in Tokyo")}>
//                 Best hotels in Tokyo
//               </button>
//               <button onClick={() => setInput("Plan a 7-day Europe trip")}>
//                 Plan a 7-day Europe trip
//               </button>
//             </div>
//           </div>
//         )}

//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`chat-message ${msg.role === "user" ? "user" : "ai"}`}
//           >
//             <div className="message-avatar">
//               {msg.role === "user" ? "👤" : "🐨"}
//             </div>
//             <div className="message-content">
//               <div className="message-text">{msg.content}</div>
//               <div className="message-time">
//                 {new Date().toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </div>
//             </div>
//           </div>
//         ))}

//         {loading && (
//           <div className="chat-message ai typing">
//             <div className="message-avatar">🐨</div>
//             <div className="message-content">
//               <div className="typing-indicator">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </div>
//               <div className="message-time">Just now</div>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} className="scroll-anchor"></div>
//       </div>

//       <form onSubmit={handleSend} className="chat-input-form">
//         <div className="input-container">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Ask about flights, hotels, or itineraries..."
//             className="chat-input"
//             disabled={loading}
//           />
//           <button
//             type="submit"
//             className="chat-send-button"
//             disabled={loading || !input.trim()}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
//             </svg>
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Chat.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 🧠 Helper: Scroll chat to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // 🟡 Load chat history from backend
  useEffect(() => {
    const loadHistory = async () => {
      const userId = localStorage.getItem("userId") || "test_user_id";
      try {
        const res = await fetch(`${API_BASE_URL}/chat/${userId}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };
    loadHistory();
  }, []);

  // 🟢 Handle sending message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userId = localStorage.getItem("userId") || "test_user_id";
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          user_query: input,
          history: newMessages,
          userId, // ✅ send userId to backend
        }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: "ai", content: data.ai_response || "No response from AI." },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "ai",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again shortly.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 Delete chat history (clear chat)
  const handleDeleteChat = async () => {
    const userId = localStorage.getItem("userId") || "test_user_id";
    if (!window.confirm("Are you sure you want to clear this chat?")) return;

    try {
      await fetch(`${API_BASE_URL}/chat/${userId}`, {
        method: "DELETE",
      });
      setMessages([]);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">💬</span>
          <h3>AI Travel Assistant</h3>
        </div>
        <p>Ask me anything about travel planning!</p>
        <button className="clear-chat-btn" onClick={handleDeleteChat}>
          🗑️ Clear Chat
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="empty-chat">
            <div className="empty-icon">🐨</div>
            <h4>Hello! I'm KoalaRoute AI</h4>
            <p>
              I can help you with flight comparisons, hotel recommendations,
              itinerary planning, and more!
            </p>
            <div className="suggestion-chips">
              <button onClick={() => setInput("Find flights to Paris")}>
                Find flights to Paris
              </button>
              <button onClick={() => setInput("Best hotels in Tokyo")}>
                Best hotels in Tokyo
              </button>
              <button onClick={() => setInput("Plan a 7-day Europe trip")}>
                Plan a 7-day Europe trip
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.role === "user" ? "user" : "ai"}`}
          >
            <div className="message-avatar">
              {msg.role === "user" ? "👤" : "🐨"}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              <div className="message-time">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message ai typing">
            <div className="message-avatar">🐨</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="message-time">Just now</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="scroll-anchor"></div>
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about flights, hotels, or itineraries..."
            className="chat-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-send-button"
            disabled={loading || !input.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
