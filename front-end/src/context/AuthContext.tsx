import { useSelector } from 'react-redux';
import {type StoreProps } from "../store/rootReducer";
import { useEffect } from 'react';
import { authenticate } from '@/src/store/auth/authActions';
import Loading from '../components/Loading';

type AuthContextProps = {
  children: React.ReactNode;
}

const AuthContext:React.FC<AuthContextProps> = ({children}) => {
  const auth = useSelector((state:StoreProps) => state.auth);

  useEffect(() => {    
    authenticate();
  }, [])

  if(auth.loading) return <Loading fullScreen/>

  return children;
}

export default AuthContext