import {
  MdManageAccounts,
  MdOutlineInventory,
  MdRotate90DegreesCcw,
} from "react-icons/md";

import { AiOutlineDashboard } from "react-icons/ai";

import { FC, SVGProps } from "react";

import { FiBookOpen, FiSettings } from "react-icons/fi";
import { Bs123 } from "react-icons/bs";

export type SidebarNavItem = {
  to: string;
  text?: string;
  items: SidebarNavItem[];
  requiredPermissions?: string[];
  icon?: FC<SVGProps<SVGSVGElement>>;
  isCollapse?: boolean;
};

export const SidebarNavigationItems: SidebarNavItem[] = [
  {
    text: "Dashboard",
    to: "/dashboard",
    icon: AiOutlineDashboard,
    items: [],
  },
  {
    text: "Catalog",
    to: "",
    icon: FiBookOpen,
    isCollapse: false,
    items: [
      {
        text: "Book",
        to: "/books",
        items: [],
        icon: Bs123,
        requiredPermissions: ["Book.Access", "Section.Access"],
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
    icon: MdOutlineInventory,
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
    icon: MdManageAccounts,
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
    icon: MdRotate90DegreesCcw,
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
        requiredPermissions: [
          "Borrowing.Access",
          "Book.Access",
          "Account.Access",
        ],
        items: [],
      },
      {
        text: "Penalties",
        to: "/borrowing/penalties",
        requiredPermissions: ["Penalty.Access", "Account.Access"],
        items: [],
      },
    ],
  },
  {
    text: "System",
    to: "/",
    icon: FiSettings,
    items: [
      {
        requiredPermissions: ["ACL.Access"],
        to: "/system/access-control/",
        text: "Role and Permission",
        items: [],
      },
      {
        requiredPermissions: ["ACL.Access", "Account.Access"],
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
