import { useMsal } from "@azure/msal-react";
import { useSidebarState } from "@contexts/SiderbarContext";
import { useNotifications } from "@hooks/data-fetching/notification";
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems, ToggleSwitch, useThemeMode } from "flowbite-react";
import { useLayoutEffect } from "react";
import { GiBookshelf, GiSchoolBag } from "react-icons/gi";
import { HiArrowSmRight, HiBookOpen, HiCalendar, HiFlag, HiInbox, HiUser } from "react-icons/hi";
import { HiOutlineQueueList } from "react-icons/hi2";
import { NavLink, useLocation } from "react-router-dom";
const NavSidebar = () => {
  const {data:notifications} = useNotifications()
  const { instance: msalClient } = useMsal();
  const logout = async () => {
    const account = msalClient.getActiveAccount();
    msalClient.logoutRedirect({
      account: account,
      logoutHint: account?.idTokenClaims?.login_hint,
    });
  };
  const notificationTotal = notifications?.reduce((a, r) => {
    if (!r.isRead) a++;
    return a;
  }, 0);
   const { isOpen, setState } = useSidebarState();
   const sidebarClass = isOpen ? "z-40" : "!hidden z-30";
   const overlayClass = isOpen ? "" : "hidden";
   const location = useLocation();
   const {toggleMode, mode} = useThemeMode()
   useLayoutEffect(() => {
    setState(false)
  }, [location]);
 
    return (
      <div className={"lg:hidden w-screen fixed h-screen z-30 bg-opacity-65  bg-gray-600 " + overlayClass}>
        <Sidebar className={sidebarClass}  >
          <div className="flex items-center gap-2 pb-10">
          <img
            src="/library-icon.svg"
            className="mr-3 h-9 lg:block"
            alt="Library Logo"/>
          <span className="self-center whitespace-nowrap text-base font-semibold dark:text-white lg:block">
            STI Munoz Library
          </span>
          </div>     
        <SidebarItems>
        <SidebarItemGroup>
            <SidebarItem as={NavLink} to="/notifications"  icon={HiInbox} label={notificationTotal}>
                Notifications
            </SidebarItem>
          </SidebarItemGroup>
          <SidebarItemGroup>
            <SidebarItem  as={NavLink} to="/catalog"  icon={GiBookshelf}>
              Catalog
            </SidebarItem>
            <SidebarItem   as={NavLink} to="/bag" icon={GiSchoolBag}>
              Bag
            </SidebarItem>
            <SidebarItem  as={NavLink} to="/borrowed-books"  href="#" icon={HiBookOpen}>
              My Books
            </SidebarItem>
            <SidebarItem  as={NavLink} to="/queues"  href="#" icon={ HiOutlineQueueList}>
              Queues
            </SidebarItem>
            <SidebarItem  as={NavLink} to="/penalties" icon={HiFlag}>
              Penalties
            </SidebarItem>
            <SidebarItem  as={NavLink} to="/reservations"  icon={HiCalendar}>
              Reservations
            </SidebarItem>
          </SidebarItemGroup>
          <SidebarItemGroup>
          <SidebarItem>
              <div className="flex gap-2">
                <span>
                  Dark Mode
                </span> 
                <ToggleSwitch checked={mode == "dark"} onChange={()=>{toggleMode()}} color="blue"/>
                
              </div>
            </SidebarItem>
            <SidebarItem  as={NavLink} to="/profile"  icon={HiUser}>
              My Account
            </SidebarItem>
            <SidebarItem  onClick={logout}  icon={HiArrowSmRight}>
              Sign Out
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
      </div>
    );
};

export default NavSidebar;