import { useContext, useEffect} from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoutes = () => {

    const { authenticated } = useContext(AuthContext);
    if (authenticated) return <Outlet/>
    return <Navigate  to={"/login"} />;
 
};

export default ProtectedRoutes;