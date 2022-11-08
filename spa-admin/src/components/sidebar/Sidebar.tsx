import { NavLink } from "react-router-dom";
import Drawer, { DrawerButton } from "./Drawer";
import { MdOutlineLibraryBooks, MdOutlineInventory, MdOutlineDashboard } from "react-icons/md";
import { RiReservedLine } from "react-icons/ri";
import {CgArrowsExchange} from 'react-icons/cg'
import { ReactNode } from "react";
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
    <Drawer
      key={item.text}
      drawerButton={<DrawerButton icon={item.icon} text={item.text ?? "NO TEXT"} />}
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
    </Drawer>
  );
};

const isNavActive = (active: boolean):string => {
  if (active) {
    return "w-full h-8 text-gray-800 bg-white text-bg-gray-800 flex items-center rounded-sm font-semibold";
  } else {
    return "w-full h-8 text-gray-400 flex items-center";
  }
};


export type SidebarNavItem = {
  to: string
  text?: string
  items:SidebarNavItem[] | []
  icon?: ReactNode | JSX.Element | JSX.Element[] 
}

export const SidebarNavigationItems:SidebarNavItem[] = 
[
    {
        text:"Dashboard",
        to:"/dashboard",
        icon:<MdOutlineDashboard className="text-xl"/>,
        items:[]
    },
    {
        text:"Books",
        to:"",
        icon:<MdOutlineLibraryBooks className="text-xl"/>,
        items:[
            {
                text:"Create book",
                to:"/books/create",
                items:[]
            },
            {
                text:"Accession",
                to:"/books/accession",
                items:[]
            },
            {
                text:"Authors",
                to:"/",
                items:[]
            },
           
            {
                text:"Cutter's Table",
                to:"/",
                items:[]
            },
            {
                text:"Dewey Decimal Class",
                to:"/",
                items:[]
            },
            
        ]
    },
    {
        text:"Inventory",
        to:"/",
        icon:<MdOutlineInventory className="text-xl"/>,
        items:[]
    },
    {
        text:"Reservation",
        to:"/",
        icon:<RiReservedLine className="text-xl"/>,
        items:[]
    },
    {
        text:"Transaction",
        to:"",
        icon:<CgArrowsExchange className="text-xl"/>,
        items:[
            {
                text:"Transact",
                to:"",
                items:[]
            },
            {
                text:"View Transaction",
                to:"",
                items:[]
            },
        ]
    },
    
    
]
export default Sidebar;
