import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setAuthenticated } from "../../features/auth/authSlice";

const AuthPage = () => {

  const handleLogIn = () => {
    
  };


  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <h1>Let's get started! </h1>
      <button className="m-2">Click Here To Set Up A New Account</button>
      <h1 className="text-2xl m-2">Sign In </h1>
      <form className="flex flex-col m-2 p-2 items-center">
        <label>UserName</label>
        <input className="ml-2 border rounded-lg"></input>
        <label>Password</label>
        <input className="ml-2 mr-2 border rounded-lg"></input>
        <button onClick={handleLogIn} className="m-4">
          Enter
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
