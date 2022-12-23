import { MdOutlineInventory, MdOutlineDashboard } from "react-icons/md";
import { RiReservedLine } from "react-icons/ri";
import { GrHomeOption } from "react-icons/gr";
import { CgArrowsExchange } from "react-icons/cg";
import { AiOutlineBook } from "react-icons/ai";
import { BsBookshelf, BsListCheck } from "react-icons/bs";
import { ReactNode } from "react";
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
    icon: <GrHomeOption className="text-xl" />,
    items: [],
  },
  {
    text: "Books",
    to: "",
    icon: <AiOutlineBook className="text-xl" />,
    items: [
      // {
      //   text: "Add book",
      //   to: "/books/create",
      //   items: [],
      // },
      {
        text: "Authors",
        to: "/books/authors",
        items: [],
      },
      // {
      //   text: "Categories",
      //   to: "/books/categories",
      //   items: [],
      // },
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
  {
    text: "Inventory",
    to: "/",
    icon: <BsBookshelf className="text-xl" />,
    items: [],
  },
  {
    text: "Reservation",
    to: "/",
    icon: <BsListCheck className="text-xl" />,
    items: [],
  },
  //   {
  //     text: "Transaction",
  //     to: "",
  //     icon: <CgArrowsExchange className="text-xl" />,
  //     items: [
  //       {
  //         text: "Transact",
  //         to: "",
  //         items: [],
  //       },
  //       {
  //         text: "View Transaction",
  //         to: "",
  //         items: [],
  //       },
  //     ],
  //   },
];
