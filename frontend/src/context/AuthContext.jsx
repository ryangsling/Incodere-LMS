import { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { api } from '../utils/api'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  loading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, loading: false }
    case 'LOADING_DONE':
      return { ...state, loading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        loadUser()
      } else {
        dispatch({ type: 'LOADING_DONE' })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUser()
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' })
      }
    })

    return () => listener?.subscription?.unsubscribe()
     
  }, [])

  async function loadUser() {
    try {
      const user = await api.auth.me()
      if (!user) {
        throw new Error('User profile not found. Ask an admin to create your account.')
      }
      dispatch({ type: 'SET_USER', payload: user })
      return user
    } catch (err) {
      console.error('loadUser error:', err)
      dispatch({ type: 'SET_USER', payload: null })
      throw err
    }
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const user = await loadUser()
    return user
  }

  async function logout() {
    await supabase.auth.signOut()
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
