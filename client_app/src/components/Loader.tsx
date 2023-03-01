import Ellipsis from '../assets/images/Ellipsis.svg'

const Loader = () => {
    return (
        <div className='w-full h-screen flex items-center justify-center bg-slate-600'>
            <img src={Ellipsis}></img>
        </div>
    );
};

export default Loader;