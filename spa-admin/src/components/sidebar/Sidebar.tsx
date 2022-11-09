import { NavLink } from "react-router-dom";
import { SidebarNavigationItems, SidebarNavItem} from "./SidebarNavigations.definition";
import { NavigationDropdownButton,NavigationDropdown} from "./NavigationDropdown";
const Sidebar = () => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-5"></div>
      <NavigationItems />
    </div>
  );
};

const NavigationItems = () => {
  return (
    <>
      {SidebarNavigationItems.map((item) => {
        console.log(item.text);
        if (item.items.length > 0) {
          return NavigationDrawer(item);
        }
        return (
          <NavLink
            className={(active) => isNavActive(active.isActive)}
            to={item.to}
            key={item.text}
          >
            <div className="ml-5 flex items-center h-11 gap-1">
              {item.icon} <span>{item.text}</span>
            </div>
          </NavLink>
        );
      })}
    </>
  );
};
const NavigationDrawer = (item: SidebarNavItem) => {
  return (
    <NavigationDropdown
      key={item.text}
      drawerButton={<NavigationDropdownButton icon={item.icon} text={item.text ?? "NO TEXT"} />}
    >
      {item.items.map((innerItem) => {
        return (
          <NavLink
            key={innerItem.text}
            className={(active) => isNavActive(active.isActive)}
            to={innerItem.to}
          >
            <small className="ml-11">{innerItem.text}</small>
          </NavLink>
        );
      })}
    </NavigationDropdown>
  );
};

const isNavActive = (active: boolean):string => {
  if (active) {
    return "w-full h-8 text-gray-800 bg-white text-bg-gray-800 flex items-center rounded-sm font-semibold";
  } else {
    return "w-full h-8 text-gray-400 flex items-center";
  }
};



export default Sidebar;
