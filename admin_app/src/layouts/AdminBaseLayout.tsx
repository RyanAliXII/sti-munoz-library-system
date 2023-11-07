import Header from "@components/Header";
import SidebarNav from "@components/sidebar/SidebarNav";
import { BaseProps } from "@definitions/props.definition";

const AdminBaseLayout = ({ children }: BaseProps) => {
  return (
    <>
      <div>
        <div className="w-full">
          <div className="" style={{ minWidth: "240px" }}>
            {/* <SidebarNav /> */}
          </div>
          <div className="flex-grow mt-10 p-2 lg:ml-56 ">{children}</div>

          {/* <*/}
        </div>
      </div>
    </>
  );
};

export default AdminBaseLayout;
