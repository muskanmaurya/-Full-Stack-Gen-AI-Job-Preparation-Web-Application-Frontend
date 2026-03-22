import { useState } from 'react'
import {  Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import {useAuth} from "../hooks/useAuth"
import '../auth.form.scss'
import "../../../style/button.scss"

const Register = () => {
    const navigate=useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    const {loading,handleRegister}=useAuth();

  const handlesubmit = async(e) => { 
        e.preventDefault()
        await handleRegister({username,email,password});
        navigate("/");
    }

    if(loading){
        return (<main><h1>Loading...</h1></main>)
    }
  return (
        <main className='auth-page'>
        <div className="form-container"> 
            <h1>Register</h1>
            <form onSubmit={handlesubmit}>
                <div className="input-group">
                    <label htmlFor='username'>Username</label>
                    <input 
                    onChange={(e)=>{setUsername(e.target.value)}}
                    type="text" id='username' placeholder='Enter your Username'/>
                </div>
                <div className="input-group">
                    <label htmlFor='email'>Email</label>
                    <input 
                    onChange={(e)=>{setEmail(e.target.value)}}
                    type="email" id='email' placeholder='Enter your Email'/>
                </div>
                <div className="input-group">
                    <label htmlFor='password'>Password</label>
                    <input 
                    onChange={(e)=>{setPassword(e.target.value)}}
                    type="password" id='password' placeholder='Enter your Password'/>
                </div>
                <button className='button primary-button'>Register</button>
            </form>
            <p>Already have an account?<Link to="/login">Login</Link></p>
        </div>
    </main>
  )
}

export default Register