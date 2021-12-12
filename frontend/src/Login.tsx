import React, { useState } from 'react';
import userService from './services/user'

const Login = (props: any) => {
  const [showSignUp, setShowSignUp] = useState<Boolean>(false)
  const [showLogin, setShowLogin] = useState<Boolean>(false)
  const [newUsername, setNewUsername] = useState<string>('')
  const [newPassword, setNewPassword] = useState<string>('')
  const [newPasswordAgain, setNewPasswordAgain] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [showMessage, setShowMessage] = useState<Boolean>(false)

  const openSignUp = () => {
    setShowSignUp(true)
  }
  const openLogin = () => {
    setShowLogin(true)
  }

  const closeSignUp = () => {
    setShowSignUp(false)
    setNewUsername('')
    setNewPassword('')
    setNewPasswordAgain('')
  }
  const closeLogin = () => {
    setShowLogin(false)
    setUsername('')
    setPassword('')
  }

  const handleMessages = (message: string) => {

    setMessage(message)
    setShowMessage(true)
    setTimeout(() => {
      setShowMessage(false)
    }, 5000)
  }

  const handleUserCreation = () => {
    if (!newUsername) {
      handleMessages('Username missing!')
    }
    if (!newPassword || !newPasswordAgain || newPassword !== newPasswordAgain) {
      handleMessages('Check passwords!')
    }
    if (newUsername && newPassword && newPasswordAgain && newPassword === newPasswordAgain) {
      try {
        userService.addUser(newUsername, newPassword)
        handleMessages('New user created!')
        setTimeout(() => {
          setShowSignUp(false)
          setNewUsername('')
          setNewPassword('')
          setNewPasswordAgain('')
        }, 5000)
      } catch (error) {
        handleMessages('Something went wrong')
      }

    }

  }

  const handleLogin = async () => {
    try {
      const response = await userService.login(username, password)

      if (response === 401) {
        handleMessages('Incorrect credentials')
      }

      if (response === 500) {
        handleMessages('Something went wrong')
      }

      if (response.username && response._id) {
        window.localStorage.setItem('user', JSON.stringify(response))
        props.setUser(response)
        setUsername('')
        setPassword('')
        setShowLogin(false)
      }

    } catch (error: any) {
      handleMessages('Something went wrong')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('user')
    props.setUser(null)
  }

  return (
    <div className="login">
      {props.user ?
        <div>
          <p>Logged in as <b>{props.user.username}</b></p>
          <button onClick={() => handleLogout()}>Log out</button>
        </div>
        :
        <div>
          <button onClick={() => openLogin()}>Log in</button>
          <button onClick={() => openSignUp()}>Sign up</button>
          {showSignUp &&
            <div className='pop-up-box'>
              <div className='box'>
                <h3>Create new user:</h3>
                <div className="new-user-form">
                  <div>
                    <label htmlFor='new-username'>Username: </label>
                    <input id="new-username" type="text" value={newUsername} onChange={({ target }) => setNewUsername(target.value)} />
                  </div>
                  <div>
                    <label htmlFor="new-password">Password: </label>
                    <input id="new-password" type="password" value={newPassword} onChange={({ target }) => setNewPassword(target.value)} />
                  </div>
                  <div>
                    <label htmlFor="new-password-again">Password again: </label>
                    <input id="new-password-again" type="password" value={newPasswordAgain} onChange={({ target }) => setNewPasswordAgain(target.value)} />
                  </div>
                </div>
                {showMessage &&
                  <div><p>{message}</p></div>
                }
                <button onClick={() => handleUserCreation()}>Create user</button>
                <button onClick={() => closeSignUp()}>Cancel</button>
              </div>
            </div>
          }

          {showLogin && <div className='pop-up-box'>
            <div className='box'>
              <h3>Login:</h3>
              <div className="login-form">
                <div>
                  <label htmlFor='username'>Username: </label>
                  <input id="username" type="text" value={username} onChange={({ target }) => setUsername(target.value)} />
                </div>
                <div>
                  <label htmlFor="password">Password: </label>
                  <input id="password" type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
                </div>
              </div>
              {showMessage &&
                <div><p>{message}</p></div>
              }
              <button onClick={() => handleLogin()}>Login</button>
              <button onClick={() => closeLogin()}>Cancel</button>
            </div>
          </div>}
        </div>
      }
    </div>
  )
}

export default Login