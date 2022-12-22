import Header from "../components/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { BaseProps } from "../definitions/props.definition";

const AdminBaseLayout = ({ children }: BaseProps) => {
  return (
    <div className="font-OS bg-gray-50">
      <Header />
      <div className="w-full h-screen flex">
        <div className="w-56 drop-shadow-md bg-white hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-grow">
          <div className="mt-28 w-full">{children}</div>
        </div>
      </div>
      {/* <div className="fixed hidden lg:block lg:w-56 z-20 lg:h-screen bg-white drop-shadow-md rounded-md">
        <Sidebar />
      </div>

      <div className="w-full lg:w-full">
        <div className="w-full bg-gray-50 h-screen">
          <Header />
          <div className="mt-28">{children}</div>
        </div>
      </div> */}
    </div>
  );
};

export default AdminBaseLayout;
