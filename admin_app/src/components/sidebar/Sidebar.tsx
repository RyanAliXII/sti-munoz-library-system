import { NavLink } from "react-router-dom";
import {
  SidebarNavigationItems,
  SidebarNavItem,
} from "./SidebarNavigations.definition";
import {
  NavigationDropdownButton,
  NavigationDropdown,
} from "./NavigationDropdown";
import { useAuthContext } from "@contexts/AuthContext";
import ProfileIcon from "@components/ProfileIcon";
import LogoutButton from "@components/LogoutButton";
import HasAccess from "@components/auth/HasAccess";
const Sidebar = () => {
  const { user } = useAuthContext();
  return (
    <div className="flex flex-col gap-3 w-full mt-20  ">
      <div className="w-full flex px-2 gap-2">
        <ProfileIcon
          givenName={user.firstname ?? ""}
          surname={user.lastname ?? ""}
        ></ProfileIcon>

        <div className="flex flex-col overflow-hidden">
          <strong className="font-medium">
            {user.firstname + " " + user.lastname}
          </strong>
          <small className="text-xs">{user.email}</small>
        </div>
      </div>
      <div className="mt-11">
        <NavigationItems />
      </div>
    </div>
  );
};

const NavigationItems = () => {
  return (
    <>
      {SidebarNavigationItems.map((item) => {
        if (item.items.length > 0) {
          return NavigationDrawer(item);
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
  return (
    <NavigationDropdown
      key={item.text}
      drawerButton={
        <NavigationDropdownButton
          icon={item.icon}
          text={item.text ?? "NO TEXT"}
        />
      }
    >
      {item.items.map((innerItem) => {
        return (
          <HasAccess requiredPermissions={innerItem.requiredPermissions ?? []}>
            <NavLink
              key={innerItem.text}
              className={(active) => isNavActive(active.isActive)}
              to={innerItem.to}
            >
              <small className="ml-11">{innerItem.text}</small>
            </NavLink>
          </HasAccess>
        );
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
