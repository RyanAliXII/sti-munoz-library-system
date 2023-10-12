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
        requiredPermissions: ["Book.Access"],
      },
      {
        text: "Accession",
        to: "/books/accessions",
        requiredPermissions: ["Book.Access"],
        items: [],
      },
      {
        text: "Author",
        to: "/books/authors",
        requiredPermissions: ["Author.Access"],
        items: [],
      },
      {
        text: "Section",
        to: "/books/sections",
        requiredPermissions: ["Section.Access"],
        items: [],
      },
      {
        text: "Publisher",
        requiredPermissions: ["Publisher.Access"],
        to: "/books/publishers",
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
        requiredPermissions: ["Audit.Access"],
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
        requiredPermissions: ["Account.Access"],
        to: "/clients/accounts",
        items: [],
      },
    ],
  },

  {
    text: "Borrowing",
    to: "/",
    icon: <MdRotate90DegreesCcw className="text-xl" />,
    items: [
      {
        text: "Borrowed Books",
        requiredPermissions: ["Borrowing.Access"],
        to: "/borrowing/requests",
        items: [],
      },
      {
        text: "Borrow Book",
        to: "/borrowing/checkout",
        requiredPermissions: ["Borrowing.Access"],
        items: [],
      },
      {
        text: "Penalties",
        to: "/borrowing/penalties",
        requiredPermissions: ["Penalty.Access"],
        items: [],
      },
    ],
  },
  {
    text: "System",
    to: "/",
    icon: <FiSettings className="text-xl" />,
    items: [
      {
        requiredPermissions: ["ACL.Access"],
        to: "/system/access-control/",
        text: "Role and Permission",
        items: [],
      },
      {
        requiredPermissions: ["ACL.Access"],
        to: "/system/access-control/assign",
        text: "Assign Role",
        items: [],
      },
      {
        requiredPermissions: ["ACL.Access"],
        to: "/system/access-control/assignments",
        text: "Role Assignments",
        items: [],
      },
      {
        requiredPermissions: ["ScannerAccount.Access"],
        to: "/system/scanner-accounts",
        text: "Scanner Accounts",
        items: [],
      },
      {
        requiredPermissions: ["ClientLog.Access"],
        to: "/system/client-logs",
        text: "Client Logs",
        items: [],
      },
      {
        to: "/system/settings",
        text: "Settings",
        items: [],
        requiredPermissions: ["Settings.Access"],
      },
    ],
  },
];
