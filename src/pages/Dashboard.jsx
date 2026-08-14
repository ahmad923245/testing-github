import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {


  const navigate = useNavigate()

  const { user: authUser } = useAuth()


  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])


  console.log("authUser", authUser)

  useEffect(() => {
    getUsers()
    getConversations()
  }, [])




  const getConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user.id

    const { data, error } = await supabase.from('conversions').select('*').or(`user_id1.eq.${userId},user_id2.eq.${userId}`)

    if (error) {
      console.log('err', error)
    }
    setConversations(data)

    console.log("conversations", data)
  }



  const getUsers = async () => {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('profiles').select('*').neq("id", user?.user?.id)

    setUsers(data)
    if (error) {
      console.log('err', error)
    }
  }



  const logOut = async () => {
    await supabase.auth.signOut();
  }



  // we have to check first if the chat conversation is already there then move direclty to chat box otherwise create conversation first then move to chat box 


  const openChat = async (otherUserId) => {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user.id


    // otherUserId is the user we want to chat with and userId is the current logged in user id
    const { data: conversions } = await supabase.from("conversions").select('*')
      .or(`and(user_id1.eq.${user.id},user_id2.eq.${otherUserId}),and(user_id1.eq.${otherUserId},user_id2.eq.${user.id})`).maybeSingle();
    console.log("conversions found?", conversions)

    if (conversions) {
      navigate(`/chat/${conversions.id}`)
      return
    }


    createConversation(userId, otherUserId)

  }


  const createConversation = async (userId, otherUserId) => {

    const { data, error } = await supabase.from("conversions")
      .insert({
        user_id1: userId,
        user_id2: otherUserId,
        sender_name: authUser?.email,
      }).select().single()

    if (error) {
      console.log("error", error)
      return;
    }

    navigate(`/chat/${data.id}`)

  }
  return (
    <div>
      Dashboard
      <p>Logged in :{authUser.email}</p>
      <button onClick={logOut}>Logout</button>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>


        <div>
          <h3>Users</h3>
          {
            users.map(user => (
              <div key={user.id}>
                <div style={{ display: 'flex' }}>
                  <h4>{user.email}</h4>
                  <button onClick={() => openChat(user.id)}>Chat</button>
                </div>
                <hr />
              </div>
            ))
          }
        </div>

        <div>
          <h3>Conversations</h3>
          {
            conversations.map(conversation => (
              <div key={conversation.id}>
                <div style={{ display: 'flex' }}>
                  <h4>{conversation?.sender_name ? conversation.sender_name : conversation.id}</h4>
                  <p>{conversation?.last_message || 'No messages yet'}</p>
                  <button onClick={() => navigate(`/chat/${conversation.id}`)}>Open Chat</button>
                </div>
                <hr />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Dashboard