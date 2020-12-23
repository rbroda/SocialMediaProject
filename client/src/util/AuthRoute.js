import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

import { AuthContext } from "../context/auth";
// Create a route to protect a logged in user from reaching the register or login pages
function AuthRoute({ component: Component, ...rest }) {
  //  Get context of the user
  const { user } = useContext(AuthContext);

  return (
    <Route
      {...rest}
      render={(props) =>
        //  Check to see if user is logged in, if so, redirect to home, else show component
        user ? <Redirect to="/" /> : <Component {...props} />
      }
    />
  );
}

export default AuthRoute;
