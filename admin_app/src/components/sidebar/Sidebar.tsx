import { useAuthContext } from "@contexts/AuthContext";
import { Sidebar } from "flowbite-react";
import { ReactNode } from "react";
const SidebarNav = () => {
  const { user } = useAuthContext();
  return (
    <Sidebar aria-label="Sidebar with multi-level dropdown example">
      <Sidebar.ItemGroup>
        <Sidebar.Item href="#">Dashboard</Sidebar.Item>
      </Sidebar.ItemGroup>
    </Sidebar>
  );
};

type SidebarItemProps = {
  to: string;
  children: ReactNode;
};

export default SidebarNav;
