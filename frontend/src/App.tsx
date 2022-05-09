import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { StyledEngineProvider, ThemeProvider } from '@mui/material'
import { CssBaseline } from '@mui/material'
import {
  HOME_PATH,
  SURVEY_PATH,
  CREATE_ZING_PATH,
  EDIT_ZING_PATH,
  DASHBOARD_PATH,
  API_ROOT,
} from '@core'
import { Home } from 'Home'
import { Survey } from 'Survey'
import { CreateZingForm } from 'CreateZing'
import { EditZing } from 'EditZing'
import { Dashboard } from 'Dashboard'
import './App.css'
import theme from '@core/Constants/Theme'
import { useEffect, useRef, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { AuthProvider, PrivateRoute, PublicRoute } from '@auth'
import { auth } from '@fire'
import axios from 'axios'

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // make something for auth state
  const [isAuthorized, setIsAuthorized] = useState(true)
  const axiosAuthInterceptor = useRef<number | null>(null)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      // need these to conditions to resolve isLoading at the correct time so data can be loaded properly
      if (user) {
        user
          .getIdToken(false) // this must be false or first load will fail
          .then((idToken) => {
            if (axiosAuthInterceptor.current === null) {
              // interceptor so that every axios request will have this header
              axiosAuthInterceptor.current = axios.interceptors.request.use(
                (request) => {
                  request.headers.authorization = `Bearer ${idToken}`
                  return request
                },
                (error) => {
                  return Promise.reject(error)
                }
              )
            }
            axios.get(`${API_ROOT}/getauthusers`).then((res) => {
              setIsAuthorized(res.data.data.includes(user.email))
              setIsLoading(false)
            })
          })
          .catch(() => {
            setIsLoading(false)
          })
      } else {
        if (axiosAuthInterceptor.current !== null) {
          axios.interceptors.request.eject(axiosAuthInterceptor.current)
          axiosAuthInterceptor.current = null
          setIsAuthorized(true) // need to reset to initial value
        }
        setIsLoading(false)
      }
    })
  }, [])

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider value={{ user: currentUser, isLoading, isAuthorized }}>
            <Switch>
              <PublicRoute exact path={HOME_PATH} component={Home} />
              <Route exact path={SURVEY_PATH} component={Survey} />
              <Route exact path={CREATE_ZING_PATH} component={CreateZingForm} />
              <PrivateRoute exact path={DASHBOARD_PATH} component={Dashboard} />
              <PrivateRoute
                exact
                path={`${EDIT_ZING_PATH}/:courseId`}
                component={EditZing}
              />
            </Switch>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
