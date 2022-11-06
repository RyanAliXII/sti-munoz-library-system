import { useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { PublicRouteProps } from '../definitions/interfaces/Props';

const PublicRoutes = ({restricted}:PublicRouteProps) => {
    const { authenticated } = useContext(AuthContext);
    if (authenticated && restricted) return <Navigate to={"/dashboard"} />;
    return <Outlet/>
 };


export default PublicRoutes;