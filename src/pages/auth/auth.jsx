import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setAuthenticated,
  setLoading,
  setError,
} from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  // Steps needed:
  // Capture email and password from the form.
  // Send a POST request to /auth/login.
  // On success, set authentication state and redirect to /dashboard.

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  ); // Gets state from Redux

  const [logInEmail, setLogInEmail] = useState("");
  const [logInPassword, setLogInPassword] = useState("");
  const [signUpUserName, setSignUpUserName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  // fetch
  const handleLogIn = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: logInEmail, password: logInPassword }),
      });
      const data = await res.json();
      if (data.success) {
        dispatch(setAuthenticated(true));
        dispatch(setError(null));
        navigate("/dashboard");
        localStorage.setItem("token", data.token);
      } else {
        dispatch(setAuthenticated(false));
        dispatch(setError(data.error || "Login failed"));
      }
    } catch (err) {
      dispatch(setAuthenticated(false));
      dispatch(setError("Network error"));
    }
    dispatch(setLoading(false));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: signUpUserName,
          email: signUpEmail,
          password: signUpPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        dispatch(setAuthenticated(true));
        dispatch(setError(null));
        navigate("/dashboard");
        localStorage.setItem("token", data.token);
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
    <div className="flex flex-col min-h-screen items-center justify-center">
      <h1>Let's get started! </h1>
      <h1 className="text-2xl m-2">Returning Users Log In Below: </h1>
      <form
        className="flex flex-col m-2 p-2 items-center"
        onSubmit={handleLogIn}
      >
        <label>Email</label>
        <input
          className="ml-2 pl-2 border rounded-lg"
          value={logInEmail}
          onChange={(e) => setLogInEmail(e.target.value)}
          type="email"
          required
        ></input>
        <label>Password</label>
        <input
          className="ml-2 pl-2 border rounded-lg"
          value={logInPassword}
          onChange={(e) => setLogInPassword(e.target.value)}
          type="password"
          required
        ></input>
        <button type="Submit" className="m-4">
          Enter
        </button>
      </form>
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex flex-col">
        <h1 className="text-2xl m-2">Create A New Account</h1>
        <form
          className="flex flex-col m-2 p-2 items-center"
          onSubmit={handleSignUp}
        >
          <label>User Name</label>
          <input
            className="ml-2 pl-2 border rounded-lg"
            value={signUpUserName}
            onChange={(e) => setSignUpUserName(e.target.value)}
            type="text"
            required
          ></input>
          <label>Email</label>
          <input
            className="ml-2 pl-2 border rounded-lg"
            value={signUpEmail}
            onChange={(e) => setSignUpEmail(e.target.value)}
            type="email"
            required
          ></input>
          <label>Password</label>
          <input
            className="ml-2 pl-2  border rounded-lg"
            value={signUpPassword}
            onChange={(e) => setSignUpPassword(e.target.value)}
            type="password"
            required
          ></input>
          <button type="Submit" className="m-4">
            Click Here To Set Up A New Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
