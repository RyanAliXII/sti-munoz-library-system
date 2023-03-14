import {
  MdOutlineInventory,
  MdManageAccounts,
  MdRotate90DegreesCcw,
} from "react-icons/md";

import { RxDashboard } from "react-icons/rx";

import { ReactNode } from "react";

import { FiBookOpen, FiSettings } from "react-icons/fi";

export type SidebarNavItem = {
  to: string;
  text?: string;
  items: SidebarNavItem[];
  requiredPermissions?: string[];
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
        requiredPermissions: ["Book.Read"],
      },
      {
        text: "Accession",
        to: "/books/accessions",
        requiredPermissions: ["Accession.Read"],
        items: [],
      },
      {
        text: "Author",
        to: "/books/authors",
        requiredPermissions: ["Author.Read"],
        items: [],
      },
      {
        text: "Section",
        to: "/books/sections",
        requiredPermissions: ["Section.Read"],
        items: [],
      },
      {
        text: "Publisher",
        requiredPermissions: ["Publisher.Read"],
        to: "/books/publishers",
        items: [],
      },
      {
        text: "Source of Fund",
        requiredPermissions: ["SOF.Read"],
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
        requiredPermissions: ["Account.Read"],
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
  {
    text: "System",
    to: "/",
    icon: <FiSettings className="text-xl" />,
    items: [
      {
        requiredPermissions: ["AccessControl.Role.Read"],
        to: "/system/access-control/",
        text: "Role and Permission",
        items: [],
      },
      {
        requiredPermissions: ["AccessControl.Role.Assign"],
        to: "/system/access-control/assign",
        text: "Assign Role",
        items: [],
      },
    ],
  },
];
