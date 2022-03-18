import React from 'react'
import { Redirect, Route } from 'react-router'
import { DASHBOARD_PATH } from '@core/Constants'
import { useAuthValue } from './AuthContext'
import { RouteProps } from '@core'

export const PublicRoute = ({
  component: Component,
  ...routeProps
}: RouteProps) => {
  const { user, isLoading } = useAuthValue()
  if (isLoading) return <div>Loading</div>
  return (
    <Route
      {...routeProps}
      render={(props) =>
        user ? <Redirect to={DASHBOARD_PATH} /> : <Component {...props} />
      }
    />
  )
}
