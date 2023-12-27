import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Login = (props) => {

    const [credentials, setCredentials] = useState({email:"",password:""});
    const navigate =useNavigate();
    const  handleSubmit =async (e)=>{
        e.preventDefault();

        const response = await fetch(`http://localhost:5000/api/auth/login`, {
            method: "POST", 
              headers: {
              "Content-Type": "application/json",
                     },
                     body: JSON.stringify({email:credentials.email,password:credentials.password})
           });
           const json = await response.json();
           console.log(json);
           if(json.success){
            //Save the auth token and redirect 
            localStorage.setItem('token',json.authtoken);
            props.showAlert("Logged in Successfullyy ", "success");
             navigate("/");

           }
           else{
            props.showAlert("Invalid Credentials", "danger");
          }
    }

    const onChange =(e)=>{
        setCredentials({...credentials,[e.target.name]:e.target.value})
  }
  return (
    <div className='mt-3'>
      <h2>Login to Continue to iNotebook</h2>
    <form onSubmit={handleSubmit}>
    <div className="mb-3">
      <label htmlFor="email" className="form-label">Email address</label>
      <input type="email" className="form-control"value = {credentials.email} id="email"  name = "email" aria-describedby="emailHelp" onChange={onChange}/>
      <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
    </div>
    <div className="mb-3">
      <label htmlFor="password" className="form-label">Password</label>
      <input type="password" className="form-control" value = {credentials.password} name="password" id="password" onChange={onChange}/>
    </div>
    
    <button type="submit" className="btn btn-primary" >Submit</button>
  </form></div>
  )
}

export default Login