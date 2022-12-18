import Header from "../components/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { BaseProps } from "../definitions/props.definition";

const AdminBaseLayout = ({ children }: BaseProps) => {
  return (
    <div className="font-OS">
      <Header />
      <div className="fixed top-28 bg-gray-50 hidden lg:block lg:w-52 lg:h-screen">
        <Sidebar />
      </div>
      <div className="w-full lg:w-full mt-24 flex">
        <div className="hidden w-60 lg:block"></div>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
};

export default AdminBaseLayout;
