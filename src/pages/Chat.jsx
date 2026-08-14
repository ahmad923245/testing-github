import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

const Chat = () => {

  const params = useParams()
  const { user } = useAuth()

  const conversationId = params.id


  const [messages, setMessages] = useState([])

  const [message, setMessage] = useState('')

  useEffect(() => {
    getMessages();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversion_id=eq.${conversationId}`,
        },
        (payload) => {

          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        console.log(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // useEffect(() => {

  //   const channel = supabase.channel("chat")
  //     .on("postgres_changes", {
  //       event: "*",
  //       schema: "public",
  //       table: "messages",
  //     },
  //       (payload) => {
  //         console.log("payload", payload)
  //       }
  //     ).subscribe((status) => {
  //       console.log(status)
  //     })
  // }, [])



  // const subscribeToMessages = async () => {

  //   supabase.channel(`chat-${conversationId}`)
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "INSERT",
  //         schema: "public",
  //         table: "messages",
  //         // filter: `conversion_id=${conversationId}`,
  //       }, (payload) => {
  //         console.log('payload is comming here', payload.new)
  //       }
  //     ).subscribe((status)=>{
  //       console.log("chat status",status)
  //     })
  // }





  const getMessages = async () => {
    const { data, error } = await supabase.from("messages").select("*").eq("conversion_id", conversationId)
      .order('created_at', {
        ascending: true
      });
    if (error) {
      console.log("error", error)
      return;
    }
    setMessages(data)
  }


  const sendMessage = async () => {
    if (!message.trim()) return;

    const { error } = await supabase.from("messages").insert({
      conversion_id: conversationId,
      sender_id: user.id,
      message: message
    })


    // update last message in conversion table so that we can show last message in dashboard

    const { error: updateError } = await supabase.from("conversions").update({
      last_message: message,
    }).eq("id", conversationId)

    if (updateError) {
      console.log("updateError", updateError)
    }
    if (error) {
      console.log("error", error)
      return;
    }

    setMessage("")
  }


  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h2>Chat</h2>

      <div
        style={{
          height: 500,
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 15,
          overflowY: "auto",
          background: "#f5f5f5",
          marginBottom: 20,
        }}
      >
        {messages.map((msg) => {
          const isMe = msg.sender_id === user.id;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  background: isMe ? "#007AFF" : "#fff",
                  color: isMe ? "#fff" : "#000",
                  padding: "10px 14px",
                  borderRadius: 16,
                  borderTopRightRadius: isMe ? 4 : 16,
                  borderTopLeftRadius: isMe ? 16 : 4,
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                  wordBreak: "break-word",
                }}
              >
                <div>{msg.message}</div>

                <div
                  style={{
                    fontSize: 11,
                    marginTop: 6,
                    textAlign: "right",
                    opacity: 0.7,
                  }}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            outline: "none",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "12px 20px",
            background: "#007AFF",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default Chat