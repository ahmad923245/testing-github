import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Nav = () => {

        const { user } = useAuth()
    


  return (
    <div>
        <Link to={'/'}>Home</Link>
        {
            !user && <>
                <Link to={'/'}>Login</Link>
                <Link to={'/signup'}>Signup</Link>
            
            </>
        }
    </div>
  )
}

export default Nav