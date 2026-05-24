import { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase } from '../utils/supabase'

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
        loadUser(data.session.user.id)
      } else {
        dispatch({ type: 'LOADING_DONE' })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUser(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' })
      }
    })

    return () => listener?.subscription?.unsubscribe()
  }, [])

  async function loadUser(authUserId) {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .single()

    dispatch({ type: 'SET_USER', payload: user || null })
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
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
