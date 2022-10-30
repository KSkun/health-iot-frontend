import {createBrowserRouter} from 'react-router-dom';

import App from './pages/App';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Device from "./pages/Device";
import Data from "./pages/Data";
import User from "./pages/User";

const router = createBrowserRouter([
    {path: '/', element: <App/>},
    {path: '/login', element: <Login/>},
    {path: '/register', element: <Register/>},
    {path: '/dashboard', element: <Dashboard/>},
    {path: '/device/:deviceID', element: <Device/>},
    {path: '/data', element: <Data/>},
    {path: '/user', element: <User/>}
]);

export default router;