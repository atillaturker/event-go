import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./authSlice";

const reduxStore = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default reduxStore;
