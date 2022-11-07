import { useContext} from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import AdminBaseLayout from '../layouts/AdminBaseLayout';

const ProtectedRoutes = () => {

    const { authenticated } = useContext(AuthContext);
    if (authenticated) return (
        <AdminBaseLayout>
            <Outlet/>
        </AdminBaseLayout>
    )
    return <Navigate  to={"/"} />;
 
};

export default ProtectedRoutes;