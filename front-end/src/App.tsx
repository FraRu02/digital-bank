import React, { useEffect, useMemo } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { StoreProps } from './store/rootReducer';
import { RoutePath, routes, type RouteProps } from './routesConfig';
import Loading from './components/Loading';
import Layout from './components/layout/Layout';
import { useSocket } from './context/SocketProvider';
import { UserStatus } from './classes/User';


const App:React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();
  const user = useSelector((state:StoreProps) => state.auth.user);
  const {loading, isAuthenticated} = useSelector((state:StoreProps) => state.auth);
  const viewList = useMemo(() => {
    if(!user) return [];
    const ls:RouteProps[] = [];
    routes.forEach((e) => {
      if(e.protected) {
        if(Array.isArray(e.protected)) {
          if(e.protected.includes(user.role)) ls.push(e);
        }else {
          ls.push(e);
        }
      }
    });
    return ls;
  }, [user])

  const isAuthToView = useMemo(() => {
    const pathname = location.pathname.slice(1);
    return Boolean(viewList.find((e) => {
      const path = e.path!.slice(1);
      if(path === "") return path===pathname;
      return pathname.includes(path)
    }));

  }, [location.pathname, viewList])

  useEffect(() => {
    if(!user) return;
    if(user.status === UserStatus.pending_verification)  navigate(RoutePath.verification);
    else navigate(viewList.find((e) => e.showInDrawer)?.path!)
  }, [user?.status])

  
  useEffect(() => {
    if(isAuthenticated && socket) socket.connect();
  }, [isAuthenticated, socket])


  
  if(!loading) {
    if(isAuthenticated) {
      if(user!.status === UserStatus.pending_verification) {
        // return <OtpVerification />
        return <Outlet />
      }
      if(isAuthToView) {
        return (
          <Layout>
            <Outlet />
          </Layout>
        );
      }else return <Navigate to={viewList.find((e) => e.showInDrawer)?.path!}/>
    }
    return <Navigate to={RoutePath.login}/>
  }else {
    return <Loading />
  }
}

export default App