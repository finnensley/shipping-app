import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
    name: "users",
    initialState: [],
    reducers: {
        setUsers: (state, action) => action.payload,
    
        updateUserPermissions: (state, action) => action.payload,
        // add appropriate function for this
        addUser: (state, action) => state.push(action.payload),
        removeUser: (state, action) => state.push(action.payload),
    }
});

export const { setUsers, updateUserPermissions, addUser, removeUser } = usersSlice.actions;

export default usersSlice.reducer;