import { NavLink } from "react-router-dom";
import {
  SidebarNavigationItems,
  SidebarNavItem,
} from "./SidebarNavigations.definition";
import { NavigationDropdown } from "./NavigationDropdown";
import { useAuthContext } from "@contexts/AuthContext";
import ProfileIcon from "@components/ProfileIcon";
import LogoutButton from "@components/LogoutButton";

const Sidebar = () => {
  const { user } = useAuthContext();
  return (
    <div className="flex flex-col gap-3 w-full mt-20">
      <div className="w-full flex px-2 gap-2">
        <ProfileIcon
          givenName={user.givenName ?? ""}
          surname={user.surname ?? ""}
        ></ProfileIcon>

        <div className="flex flex-col overflow-hidden">
          <strong className="font-medium">
            {user.givenName + " " + user.surname}
          </strong>
          <small className="text-xs">{user.email}</small>
        </div>
      </div>
      <div className="mt-11">
        <SidebarItems />
      </div>
    </div>
  );
};

const SidebarItems = () => {
  return (
    <>
      {SidebarNavigationItems.map((item) => {
        //if item has children navigation, render a nav with  drawer
        if (item.items.length > 0) {
          return (
            <NavigationDrawer
              items={item.items}
              to={item.to}
              icon={item.icon}
              text={item.text}
              key={item.text}
            />
          );
        }
        return (
          <NavLink
            className={(active) => isNavActive(active.isActive)}
            to={item.to}
            key={item.text}
          >
            <div className="ml-5 flex items-center h-10 gap-1">
              {item.icon}
              <span className="font-medium text-sm ">{item.text}</span>
            </div>
          </NavLink>
        );
      })}
      <LogoutButton />
    </>
  );
};
const NavigationDrawer = (item: SidebarNavItem) => {
  const { hasPermissions } = useAuthContext();
  return (
    <NavigationDropdown key={item.text} icon={item.icon} text={item.text ?? ""}>
      {item.items.map((innerItem) => {
        return hasPermissions(innerItem.requiredPermissions ?? []) ? (
          <NavLink
            key={innerItem.text}
            className={(active) => isNavActive(active.isActive)}
            to={innerItem.to}
          >
            <small className="ml-11">{innerItem.text}</small>
          </NavLink>
        ) : null;
      })}
    </NavigationDropdown>
  );
};

const isNavActive = (active: boolean): string => {
  if (active) {
    return "w-full h-10 flex items-center rounded-sm  text-gray-100 rounded bg-blue-500 rounded-r";
  } else {
    return "w-full h-10 flex items-center text-gray-600";
  }
};

export default Sidebar;
