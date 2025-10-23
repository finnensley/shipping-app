import React from 'react';

const UserSignIn = () => {

    return (
        <div>
            <h1>Sign In </h1>
            <form>
                <label>UserName</label>
                <input placeholder="enter username"></input>
                <label >Password</label>
                <input placeholder="enter password"></input>
                <button>Enter</button>
            </form>
            <p> Or</p> 
            <button>Click Here To Set Up A New Account</button>
            
        </div>
    )
}

export default UserSignIn;