import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { BaseProps } from '../definitions/interfaces/Props';

const AdminBaseLayout = ({children}:BaseProps) => {
    return (
        <div>
            <Header/>
        <div className='fixed top-0 bg-gray-800 text-white hidden lg:block lg:w-52 lg:h-screen'>
                <Sidebar/>
            </div>
                <div className='w-full lg:w-full mt-24 flex'>
                    <div className='hidden w-60 lg:block'></div>
                    <div className='w-full bg-gray-100'>
                         {children}
                    </div>
                </div>
            
        </div>
    );
};

export default AdminBaseLayout;