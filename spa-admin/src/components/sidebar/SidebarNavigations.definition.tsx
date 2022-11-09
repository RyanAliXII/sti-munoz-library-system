
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