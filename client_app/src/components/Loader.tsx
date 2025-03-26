import Ellipsis from '../assets/images/Ellipsis.svg'

const Loader = () => {
    return (
        <div className='w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-700'>
            <img src={Ellipsis}></img>
        </div>
    );
};

export default Loader;