import React from 'react'
import { Redirect, Route } from 'react-router'
import { HOME_PATH } from '@core/Constants'
import { useAuthValue } from './AuthContext'
import { RouteProps } from '@core'
import { RouteLoading } from './RouteLoading'
import { Box, Button, Container, Typography } from '@mui/material'
import { logOut } from '@fire'

export const PrivateRoute = ({
  component: Component,
  ...routeProps
}: RouteProps) => {
  const { authState } = useAuthValue()

  switch (authState) {
    case 'loading':
      return <RouteLoading isLoading={true} />
    case 'unauthenticated':
      return (
        <Route
          {...routeProps}
          render={() => {
            return <Redirect to={HOME_PATH} />
          }}
        />
      )
    case 'unauthorized':
      return (
        <Container maxWidth="md">
          <Typography variant="h5" component="p" align="center" mt={5}>
            You are not authorized to view this content. Contact an admin if you
            feel like this is a mistake. Click the button below to log out.
          </Typography>
          <Box display="flex" justifyContent="center" margin={4}>
            <Button onClick={logOut}>Log out</Button>
          </Box>
        </Container>
      )
    case 'authorized':
      return (
        <Route
          {...routeProps}
          render={(props) => {
            return <Component {...props} />
          }}
        />
      )
  }

  // if (isLoading) return <RouteLoading isLoading />
  // if (!isAuthorized)
  //   return (
  //     <Container maxWidth="md">
  //       <Typography variant="h5" component="p" align="center" mt={5}>
  //         You are not authorized to view this content. Contact an admin if you
  //         feel like this is a mistake. Click the button below to log out.
  //       </Typography>
  //       <Box display="flex" justifyContent="center" margin={4}>
  //         <Button
  //           onClick={() => {
  //             logOut().then(() => {
  //               history.push('/')
  //             })
  //           }}
  //         >
  //           Log out
  //         </Button>
  //       </Box>
  //     </Container>
  //   )
  //
  // return (
  //   <Route
  //     {...routeProps}
  //     render={(props) => {
  //       return user && isAuthorized ? (
  //         <Component {...props} />
  //       ) : (
  //         <Redirect to={HOME_PATH} />
  //       )
  //     }}
  //   />
  // )
}
