import React, { useEffect, useRef, useState } from "react";
import Avatar from '../../assets/Avatar.png'
import Input from '../../components/Input'
import { io } from 'socket.io-client'

const Dashboard = () => {

    
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user:detail')))
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([{}])
    const [users, setUsers] = useState([])
    const [message, setMessage] = useState('')
    const [socket, setSocket] = useState(null)
    const messageRef = useRef(null)

    // console.log('user :>>', user);
    // console.log('conversations :>>', conversations);
    // console.log('users :>>', users);
    console.log('messages :>>', messages);

    useEffect(() => {
        setSocket(io('http://localhost:8080'))
    }, [])

    useEffect(() => {
        socket?.emit('addUser', user?.id);
        socket?.on('getUsers', users =>{
            console.log('activeUsers :>>', users);
        });
        socket?.on('getMessage', data =>{
            console.log('data :>>', data);
            setMessages(prev =>({
                ...prev,
                messages: [...prev.messages, {user: user?.data?.user, message: data.message}]
            }));
        });
    }, [socket])
    
    useEffect(() => {
      messageRef?.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages.messages])
    

    useEffect(() => {
        const loggedInUser = JSON.parse(localStorage.getItem('user:detail'))
        const fetchConversations = async () =>{
            const res = await fetch(`http://localhost:8000/api/conversations/${loggedInUser?.id}`,{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                }
            });
            const resData = await res.json();
            // console.log('resData :>>', resData);
            setConversations(resData);
        }
        fetchConversations();
    }, [])


    useEffect(()=>{
        const fetchUsers = async()=>{
            const res = await fetch(`http://localhost:8000/api/users/${user?.id}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const resData = await res.json();
            // console.log('resData :>>', resData);
            setUsers(resData);
        }
        fetchUsers();
    }, [])
    
    
    const fetchMessages = async(conversationId, receiver) =>{
        const res = await fetch(`http://localhost:8000/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const resData  = await res.json();
        // console.log('resData :>>', resData);
        setMessages({messages: resData, receiver, conversationId});
    }

    const sendMessage = async(e) =>{
        //console.log('SendMesage :>> ', message, message?.conversationId, user?.id, messages?.receiver?.receiverId);
        socket?.emit('sendMessage', {
            senderId: user?.id,
            receiverId: messages?.receiver?.receiverId,
            message,
            conversationId: messages?.conversationId
        });
        const res = await fetch(`http://localhost:8000/api/message`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversationId: messages?.conversationId,
                senderId: user?.id,
                message,
                receiverId: messages?.receiver?.receiverId
            })
        });
        setMessage('');
    }

  return (
    <div className='flex w-screen'>
        <div className='w-[25%] h-screen bg-secondary overflow-auto'>
            <div className='flex justify-center items-center my-8 mx-14'>
                <div className='border border-primary p-2px rounded-full'>
                    <img src={Avatar} width={75} height={75}/>
                </div>
                <div className='ml-8'>
                    <h3 className='text-2xl'>{user?.fullName}</h3>
                    <p className='text-lg font-light'>My Account</p>
                </div>
            </div>
            <hr/>
            <div className='mx-14 mt-10'>
                <div className='text-primary text-lg'>Messages</div>
                <div>
                    {
                        conversations.length > 0 ?
                            conversations.map(({conversationId, user}) => {
                                return(
                                    <div className='flex  items-center py-8 border-b border-b-gray-300'>
                                        <div className='cursor-pointer item-center flex' onClick={()=>{
                                            fetchMessages(conversationId, user);
                                        }}>
                                            <div>
                                                <img src={Avatar} width={50} height={50}/>
                                            </div>
                                            <div className='ml-6'> 
                                                <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                                                <p className='text-sm font-light text-gray-600'>{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        : <div className="text-center text-lg font-semibold mt-24">No conversations</div>
                    }
                </div>
            </div>
        </div>
        <div className='w-[50%] h-screen bg-white flex flex-col items-center'>
        {
            messages?.receiver?.fullName &&
            <div className='w-[75%] bg-secondary h-[80px] my-14 rounded-full flex items-center px-14 py-2'>
                <div className='cursor-pointer'><img src={Avatar} width={50} height={50}/></div>
                <div className='ml-6 mr-auto'> 
                    <h3 className='text-lg '>{messages?.receiver?.fullName}</h3>
                    <p className='text-sm font-light text-gray-600'>{messages?.receiver?.email}</p>
                </div>
                <div className='cursor-pointer'>
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-phone" width="28" height="28" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                    </svg>
                </div>
                
            </div>

        }

            <div className='h-[75%]  w-full overflow-y-auto overflow-x-auto shadow-sm'>
                <div className='p-14'>
                    {
                        messages?.messages?.length > 0 ?
                        messages.messages.map(({message, user: {id} = {}}) =>{
                            return(
                                <>
                                    <div className={`max-w-[40%] p-4 mb-6 ${ id === user?.id ? 'bg-primary rounded-b-xl rounded-tl-xl text-white ml-auto' :
                                    'bg-secondary rounded-b-xl rounded-tr-xl'}`}>
                                        {message}
                                    </div>
                                    <div ref={messageRef}></div>
                                </>
                            )
                            // if(id === user?.id)
                            // {
                            //     return(
                            //         <div className='max-w-[40%] bg-secondary rounded-b-xl rounded-tr-xl p-4 mb-6'>
                            //             {message}
                            //         </div>
                            //     )
                            // }
                            // else{
                            //     return(
                            //         <div className='max-w-[40%] bg-primary rounded-b-xl rounded-tl-xl ml-auto text-white p-4 mb-6'>
                            //             {message}
                            //         </div>
                            //     )
                            // }
                        }): <div className="text-center text-lg font-semibold mt-24">No Messages</div>
                    }
                </div>
            </div>
            {
                messages?.receiver?.fullName &&
                <div className='p-14 w-full flex items-center'>
                        <Input placeholder='Type a message...' value={message} onChange={(e)=>{setMessage(e.target.value)}} className='w-[75%]' inputClassName='p-4 border-0 shadow-md rounded-full  
                        bg-light focus:ring-0 foucs:border-0 outine-none'/>
                        <div className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'}`} onClick={()=>sendMessage()}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-send" width="30" height="30" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M10 14l11 -11"></path>
                            <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"></path>
                            </svg>
                        </div>
                        <div className={`ml-4 p-2 cursor-pointer bg-light rounded-full ${!message && 'pointer-events-none'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-circle-plus" width="30" height="30" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <div className='text-primary text-lg'>Messages</div>                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                            <path d="M9 12l6 0"></path>
                            <path d="M12 9l0 6"></path>
                            </svg>
                        </div>
                </div>
            }
        </div>
        
        <div className='w-[25%] h-screen px-8 py-16 overflow-auto'>
        <div className='text-primary text-lg'>People</div>
        <div>
            {
                users.length > 0 ?
                    users.map(({userId, user}) => {
                        return(
                            <div className='flex  items-center py-8 border-b border-b-gray-300'>
                                <div className='cursor-pointer item-center flex' onClick={()=>{
                                    fetchMessages('new', user);
                                }}>
                                    <div>
                                        <img src={Avatar} width={50} height={50}/>
                                    </div>
                                    <div className='ml-6'> 
                                        <h3 className='text-lg font-semibold'>{user?.fullName}</h3>
                                        <p className='text-sm font-light text-gray-600'>{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                : <div className="text-center text-lg font-semibold mt-24">No conversations</div>
            }
        </div>
        </div>
    </div>
  )
}

export default Dashboard
