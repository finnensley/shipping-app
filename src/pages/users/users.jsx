import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import useFetchData from "../../components/useFetchData";
import { motion, AnimatePresence } from "framer-motion";
import {
  setUsers,
  updateUserPermissions,
  addUser,
  removeUser,
} from "../../features/users/usersSlice";

const UsersPage = () => {
  const users = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const { data, loading, error } = useFetchData("users");

  // When API data loads, update Redux state
  useEffect(() => {
    if (data && data.users) {
      dispatch(setUsers(data.users));
    }
  }, [data, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading users.</div>;

  const handlePasswordReset = () => {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full max-w-3xl mx-auto mt-8 ">
        <div className="grid grid-cols-4 gap-12 border-b-4 rounded-t-lg px-4 py-2 text-white font-bold text-lg sticky top-0 z-10">
          <div>USERNAME</div>
          <div>EMAIL</div>
          <div>PERMISSIONS</div>
          <div>PASSWORD</div>
        </div>
        <ul>
          {(users || []).map((user) => (
            <li
              key={user.id}
              className="grid grid-cols-4 gap-6 border-b border-gray-700 px-4 py-2 text-white items-center"
            >
              <div>{user.username} </div>
              <div>{user.email}</div>
              <div>{user.permissions}</div>
              <button className="rounded" onClick={handlePasswordReset}>
                Reset
              </button>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default UsersPage;
