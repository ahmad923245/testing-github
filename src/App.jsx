import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Nav from './components/Nav/Nav'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './ProtectedRoute'

function App() {


  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path='/' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/chat/:id' element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </BrowserRouter>

    </AuthProvider>
  )
}

export default App
