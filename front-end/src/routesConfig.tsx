import React from "react";
import { type RouteObject } from "react-router-dom"
import App from "./App";
import Login from '@/src/views/Login';
import Signin from '@/src/views/Signin';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Dashboard from "@/src/views/Dashboard";
import Profile from "./views/Profile";
import Users from "./views/Users";
import { UserRole } from "./classes/User";
import Transactions from "./views/Transactions";
import BankAccounts from "./views/BankAccounts";
import Cards from "./views/Cards";
import GroupIcon from '@mui/icons-material/Group';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import Holders from "./views/Holders";
import OtpVerification from "./views/OtpVerification";

export type RouteProps = Omit<RouteObject, "children"> & {
  children?: Array<RouteProps>;
  icon?: React.ReactNode;
  showInDrawer?: boolean;
  protected?: boolean|UserRole[];
  label?: string
}

export enum RoutePath {
  "/" = "/",
  login = "/login",
  signin = "/signin",
  profile = "/profile",
  users = "/users",
  transactions = "/transactions",
  bankAccounts = "/bankAccounts",
  cards = "/cards",
  holders = "/holders",
  verification = "/verification"
} 

export const routes:Array<RouteProps> = [
  {
    path: RoutePath.profile,
    element: <Profile />,
    label: "profile",
    protected: true,
  },
  {
    path: RoutePath.verification,
    element: <OtpVerification />,
    label: "verify",
    protected: true,
  },
  {
    path: RoutePath["/"],
    element: <Dashboard />,
    label: "Dashboard",
    showInDrawer: true,
    protected: [UserRole.member],
    icon: <DashboardIcon />,
  },
  {
    path: RoutePath.users,
    element: <Users />,
    label: "user_other",
    showInDrawer: true,
    protected: [UserRole.admin],
    icon: <GroupIcon />,
  },
  {
    path: RoutePath.holders,
    element: <Holders />,
    label: "holder_other",
    showInDrawer: true,
    protected: [UserRole.admin],
    icon: <NoAccountsIcon />,
  },
  {
    path: RoutePath.transactions,
    element: <Transactions />,
    label: "transaction_other",
    showInDrawer: true,
    protected: [UserRole.admin],
    icon: <CurrencyExchangeIcon />,
  },
  {
    path: RoutePath.bankAccounts,
    element: <BankAccounts />,
    label: "bank_account_other",
    showInDrawer: true,
    protected: [UserRole.admin],
    icon: <AccountBalanceIcon />,
  },
  {
    path: RoutePath.cards,
    element: <Cards />,
    label: "card_other",
    showInDrawer: true,
    protected: [UserRole.admin],
    icon: <CreditCardIcon />,
  },
  {
    path: RoutePath.login,
    element: <Login />,
  },
  {
    path: RoutePath.signin,
    element: <Signin />,
  },
]

const routesObj:Array<RouteProps> = [
  {
    path: RoutePath["/"],
    element: <App />,
    children: routes.filter((el) => el.protected),
  },
  ...routes.filter((el) => !el.protected)
]

export default  routesObj;
