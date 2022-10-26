import {createBrowserRouter} from 'react-router-dom';

import App from './pages/App';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Device from "./pages/Device";

const router = createBrowserRouter([
    {path: '/', element: <App/>},
    {path: '/login', element: <Login/>},
    {path: '/register', element: <Register/>},
    {path: '/dashboard', element: <Dashboard/>},
    {path: '/device/:deviceID', element: <Device/>}
]);

export default router;