import React from "react";

const UserSignIn = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl">Sign In </h1>
      <form className="flex flex-col m-2 p-2 items-center ">
        <label>UserName</label>
        <input className="ml-2 border rounded-lg"></input>
        <label>Password</label>
        <input className="ml-2 mr-2 border rounded-lg"></input>
        <button className="m-4">Enter</button>
      </form>
      <button>Click Here To Set Up A New Account</button>
    </div>
  );
};

export default UserSignIn;
