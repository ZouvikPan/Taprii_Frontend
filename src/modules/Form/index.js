import React, { useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { useNavigate } from 'react-router-dom'
const Form = ({
    isSignInPage = false,
}) => {
    const [data, setData] = useState({
        ...(!isSignInPage && {
            fullName:''
        }),
        email:'',
        password:''
    })
    console.log('data:>> ', data);
    const navigate = useNavigate();
  return (
    <div className="bg-[#edf3fc] h-screen flex justify-center items-center">
        <div className="bg-white w-[600px] h-[800px] shadow-lg rounded-lg flex flex-col justify-center items-center">
            <div className="text-4xl font-extrabold">Welcome {isSignInPage && 'Back'}</div>
            <div className="text-xl font-light mb-14">{isSignInPage? "Sign In to enter your Taprii":"Sign Up to explore Taprii"}</div>
            <form className="flex flex-col items-center " onSubmit={()=>console.log("Submitted")}>
                {!isSignInPage && <Input label="Full Name" name="name" placeholder="Enter your full name" isRequired="true"  className="mb-6" value={data.fullName} 
                onChange={(e)=> setData({...data, fullName:e.target.value})} />}
                <Input label="Email Address" type="email" name="email" placeholder="Enter your email" isRequired="true" className="mb-6" value={data.email} onChange={(e)=> setData({...data, email:e.target.value})} />
                <Input label="Password" type="password" name="password" placeholder="Enter your password" isRequired="true"  className="mb-6" value={data.password} onChange={(e)=> setData({...data, password:e.target.value})} />
                <Button label={isSignInPage? "Sign In":"Sign Up"} type="submit" className="w-[50%] mb-2 mt-6" />
            </form>
            <div>{isSignInPage? "Don't have an existing account? ":"Already have an account? "}<span className="text-primary cursor-pointer underline" onClick={()=>navigate(`/users/${isSignInPage?'sign_up':'sign_in'}`)}>{isSignInPage?"Sign Up":"Sign In"}</span></div>
        </div>
    </div>
    
  )
}

export default Form
