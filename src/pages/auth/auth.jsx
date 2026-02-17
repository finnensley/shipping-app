import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setAuthenticated,
  setLoading,
  setError,
} from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { authCall } from "../../utils/api";

const AuthPage = () => {
  // Steps needed:
  // Capture email and password from the form.
  // Send a POST request to /auth/login.
  // On success, set authentication state and redirect to /dashboard.

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth,
  ); // Gets state from Redux

  const [logInEmail, setLogInEmail] = useState("");
  const [logInPassword, setLogInPassword] = useState("");
  const [signUpUserName, setSignUpUserName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

  // fetch
  const handleLogIn = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const data = await authCall.post("/login", {
        email: logInEmail,
        password: logInPassword,
      });
      if (data.success) {
        // Store token FIRST, then navigate
        localStorage.setItem("token", data.token);
        dispatch(setAuthenticated(true));
        dispatch(setError(null));
        navigate("/dashboard");
      } else {
        dispatch(setAuthenticated(false));
        dispatch(setError(data.error || "Login failed"));
      }
    } catch (err) {
      console.error("Login error:", err);
      dispatch(setAuthenticated(false));
      dispatch(setError(err.message || "Network error"));
    }
    dispatch(setLoading(false));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const data = await authCall.post("/signup", {
        username: signUpUserName,
        email: signUpEmail,
        password: signUpPassword,
      });
      if (data.success) {
        // Store token FIRST, then navigate
        localStorage.setItem("token", data.token);
        dispatch(setAuthenticated(true));
        dispatch(setError(null));
        navigate("/dashboard");
      } else {
        dispatch(setAuthenticated(false));
        dispatch(setError(data.error) || "Sign Up failed");
      }
    } catch (err) {
      dispatch(setAuthenticated(false));
      dispatch(setError("Network error"));
    }
    dispatch(setLoading(false));
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1>Let's get started! </h1>
      <h1 className="text-2xl m-2">Returning Users Log In Below: </h1>
      <form
        className="flex flex-col m-2 p-2 items-center"
        onSubmit={handleLogIn}
      >
        <label>Email</label>
        <input
          className="ml-2 w-full pl-2 border rounded-lg"
          value={logInEmail}
          onChange={(e) => setLogInEmail(e.target.value)}
          type="email"
          required
        ></input>
        <label>Password</label>
        <input
          className="ml-2 w-full pl-2 border rounded-lg"
          value={logInPassword}
          onChange={(e) => setLogInPassword(e.target.value)}
          type="password"
          required
        ></input>
        <button type="Submit" className="m-4">
          Enter
        </button>
      </form>
      <button
        type="button"
        onClick={() => setShowSignUp(!showSignUp)}
        className="m-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {showSignUp ? "Back to Login" : "Sign Up"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
      <AnimatePresence>
        {showSignUp && (
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl m-2">Create A New Account</h1>
            <form
              className="flex flex-col m-2 p-2 items-center"
              onSubmit={handleSignUp}
            >
              <label>User Name</label>
              <input
                className="ml-2 w-fit pl-2 border rounded-lg"
                value={signUpUserName}
                onChange={(e) => setSignUpUserName(e.target.value)}
                type="text"
                disabled
                required
              ></input>
              <label>Email</label>
              <input
                className="ml-2 w-fit pl-2 border rounded-lg"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                type="email"
                disabled
                required
              ></input>
              <label>Password</label>
              <input
                className="ml-2 w-fit pl-2  border rounded-lg"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                type="password"
                disabled
                required
              ></input>
              <button type="Submit" className="m-4" disabled>
                Click Here To Set Up A New Account
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AuthPage;
