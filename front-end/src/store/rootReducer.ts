import { combineReducers, configureStore } from "@reduxjs/toolkit";
import auth from "./auth/authSlice";
import theme from "./theme/themeSlice";


const combinedReducer = combineReducers({
  auth,
  theme
});

const store = configureStore({
  reducer: combinedReducer
});

export type StoreProps = ReturnType<typeof combinedReducer>; 

export default store;

