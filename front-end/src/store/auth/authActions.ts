import type { UserProps } from "@/src/classes/User";
import { authSliceActions } from "./authSlice";
import store from "@/src/store/rootReducer";
import { queryClient } from "@/src/main";
import SocketIo from "@/src/classes/SocketIo/SocketIo";

export const authenticate = async():Promise<UserProps> => {
  return await store.dispatch(authSliceActions.authenticate()).unwrap();
}

export const login = async(email:string, password:string):Promise<UserProps> => {
  return await store.dispatch(authSliceActions.login({email, password})).unwrap();
}

export const signin = async(name:string, lastname:string, email:string, taxCode:string, password:string):Promise<UserProps> => {
  return await store.dispatch(authSliceActions.signin({name, lastname, email, taxCode, password})).unwrap();
}

export const logout = async():Promise<void> => {
  queryClient.clear();
  SocketIo.instance?.disconnect();
  localStorage.removeItem("selectedCard");
  return await store.dispatch(authSliceActions.logout()).unwrap();
}

export const refreshToken = async():Promise<void> => {
  return await store.dispatch(authSliceActions.refreshToken()).unwrap();
}

export const verifyOtp = async(code: string):Promise<UserProps> => {
  return await store.dispatch(authSliceActions.verifyOtp({code})).unwrap();
}


export const resendOtp = async():Promise<UserProps> => {
  return await store.dispatch(authSliceActions.resendOtp()).unwrap();
}
