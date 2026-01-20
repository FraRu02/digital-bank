import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/rootReducer.ts';
import { CssBaseline } from '@mui/material';
import routesObj from './routesConfig.tsx';
import { createBrowserRouter, RouterProvider, type RouteObject } from 'react-router-dom';
import AuthProvider from './context/AuthContext.tsx';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/it';
import { LocalizationProvider } from '@mui/x-date-pickers';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import "./i18n";
import React from 'react';
import CustomThemeProvider from './context/CustomThemeContext.tsx';
import { ToastContainer } from 'react-toastify';
import SocketProvider from './context/SocketProvider.tsx';


const router = createBrowserRouter(routesObj as Array<RouteObject>);


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
})

const container = document.getElementById("root")!;

let root: Root;

if (!(window as any).__reactRoot) {
  root = createRoot(container);
  (window as any).__reactRoot = root;
} else {
  root = (window as any).__reactRoot;
}
// createRoot(document.getElementById('root')!).render()
root.render(
  <Provider store={store}>
    <React.Suspense fallback="loading">
      <SocketProvider>
        <CustomThemeProvider>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <RouterProvider router={router}/>
                <ToastContainer />
              </AuthProvider>
            </QueryClientProvider>
          </LocalizationProvider>
        </CustomThemeProvider>
      </SocketProvider>
    </React.Suspense>
  </Provider>
)
