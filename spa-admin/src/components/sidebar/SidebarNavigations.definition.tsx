import { MdOutlineInventory, MdOutlineDashboard } from "react-icons/md";
import { RiReservedLine } from "react-icons/ri";
import { GrHomeOption } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { AiOutlineBook } from "react-icons/ai";
import { BsBookshelf, BsListCheck } from "react-icons/bs";
import { ImBooks } from "react-icons/im";
import { ReactNode } from "react";
import { CgArrowsExchange } from "react-icons/cg";
import { FiBookOpen } from "react-icons/fi";
export type SidebarNavItem = {
  to: string;
  text?: string;
  items: SidebarNavItem[] | [];
  icon?: ReactNode | JSX.Element | JSX.Element[];
};

export const SidebarNavigationItems: SidebarNavItem[] = [
  {
    text: "Dashboard",
    to: "/dashboard",
    icon: <RxDashboard className="text-xl" />,
    items: [],
  },
  {
    text: "Catalog",
    to: "",
    icon: <FiBookOpen className="text-xl" />,
    items: [
      {
        text: "Books",
        to: "/books/",
        items: [],
      },
      {
        text: "Accessions",
        to: "/books/accessions",
        items: [],
      },
      {
        text: "Authors",
        to: "/books/authors",
        items: [],
      },
      {
        text: "Sections",
        to: "/books/sections",
        items: [],
      },
      {
        text: "Publishers",
        to: "/books/publishers",
        items: [],
      },
      {
        text: "Source of Funds",
        to: "/books/source-of-funds",
        items: [],
      },
    ],
  },
  // {
  //   text: "Inventory",
  //   to: "/",
  //   icon: <MdOutlineInventory className="text-xl" />,
  //   items: [],
  // },
  // {
  //   text: "Reservation",
  //   to: "/",
  //   icon: <BsListCheck className="text-xl" />,
  //   items: [],
  // },
  // {
  //   text: "Transaction",
  //   to: "",
  //   icon: <CgArrowsExchange className="text-xl" />,
  //   items: [
  //     {
  //       text: "Transact",
  //       to: "",
  //       items: [],
  //     },
  //     {
  //       text: "View Transaction",
  //       to: "",
  //       items: [],
  //     },
  //   ],
  // },
];
