import {
  MdOutlineInventory,
  MdManageAccounts,
  MdRotate90DegreesCcw,
} from "react-icons/md";
import { RiReservedLine } from "react-icons/ri";
import { GrHomeOption, GrTransaction } from "react-icons/gr";
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
        text: "Book",
        to: "/books/",
        items: [],
      },
      {
        text: "Accession",
        to: "/books/accessions",
        items: [],
      },
      {
        text: "Author",
        to: "/books/authors",
        items: [],
      },
      {
        text: "Section",
        to: "/books/sections",
        items: [],
      },
      {
        text: "Publisher",
        to: "/books/publishers",
        items: [],
      },
      {
        text: "Source of Fund",
        to: "/books/source-of-funds",
        items: [],
      },
    ],
  },

  {
    text: "Inventory",
    to: "/",
    icon: <MdOutlineInventory className="text-xl" />,
    items: [
      {
        text: "Audit",
        to: "/inventory/audits",
        items: [],
      },
    ],
  },
  {
    text: "Client",
    to: "/",
    icon: <MdManageAccounts className="text-xl" />,
    items: [
      {
        text: "Account",
        to: "/clients/accounts",
        items: [],
      },
    ],
  },

  {
    text: "Circulation",
    to: "/",
    icon: <MdRotate90DegreesCcw className="text-xl" />,
    items: [
      {
        text: "Return",
        to: "/circulation/transactions",
        items: [],
      },
      {
        text: "Checkout",
        to: "/circulation/checkout",
        items: [],
      },
      // {
      //   text: "Return",
      //   to: "/circulation/return",
      //   items: [],
      // },
    ],
  },
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
