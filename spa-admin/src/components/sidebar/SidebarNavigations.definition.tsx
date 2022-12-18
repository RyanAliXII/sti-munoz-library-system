
import { MdOutlineLibraryBooks, MdOutlineInventory, MdOutlineDashboard } from "react-icons/md";
import { RiReservedLine } from "react-icons/ri";
import {CgArrowsExchange} from 'react-icons/cg'
import { ReactNode } from "react";
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
                  text:"Add book",
                  to:"/books/create",
                  items:[]
              },
              {
                  text:"Authors",
                  to:"/books/authors",
                  items:[]
              },
              {
                text:"Categories",
                to:"/books/categories",
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