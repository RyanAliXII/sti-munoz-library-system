import { useAuthContext } from "@contexts/AuthContext";
import { Sidebar } from "flowbite-react";

const SidebarNav = () => {
  //const { user } = useAuthContext();
  console.log(Sidebar.Item);
  return (
    <Sidebar aria-label="Multilevel sidebar">
      <Sidebar.Items>
        <Sidebar.ItemGroup></Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default SidebarNav;
