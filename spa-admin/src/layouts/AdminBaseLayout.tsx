import Header from "../components/Header";
import Sidebar from "../components/sidebar/Sidebar";
import { BaseProps } from "../definitions/props.definition";

const AdminBaseLayout = ({ children }: BaseProps) => {
  return (
    <div className="font-OS bg-gray-50 h-screen">
      <Header />

      <div className="w-full h-full flex">
        <div className="w-56 drop-shadow-md bg-white hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-grow h-full overflow-y-scroll">
          <div className="mt-28 w-full h-full">{children}</div>
        </div>
        {/* <*/}
      </div>
    </div>
  );
};

export default AdminBaseLayout;
