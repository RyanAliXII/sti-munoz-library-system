import { useSidebarState } from "@contexts/SiderbarContext";
import { Sidebar, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { NavLink, useLocation } from "react-router-dom";
import { SidebarNavigationItems } from "./SidebarNavigations.definition";
const SidebarNav: FC = function () {
  const [currentPage, setCurrentPage] = useState("");
  useEffect(() => {
    const newPage = window.location.pathname;
    setCurrentPage(newPage);
  }, [setCurrentPage]);
  const { isOpen } = useSidebarState();
  const sidebarClass = isOpen ? "!flex" : "";
  return (
    <Sidebar
      aria-label="Sidebar with multi-level dropdown example"
      className={`hidden lg:flex ${sidebarClass}`}
    >
      <div className="flex h-full flex-col justify-between py-2">
        <div>
          <form className="pb-3">
            <TextInput
              icon={HiSearch}
              type="search"
              placeholder="Search"
              required
              size={32}
            />
          </form>
          <SiderbarItems></SiderbarItems>
        </div>
      </div>
    </Sidebar>
  );
};
const SiderbarItems = () => {
  const location = useLocation();
  const activeClass = "bg-gray-100 dark:bg-gray-700";

  return (
    <Sidebar.Items>
      <Sidebar.ItemGroup>
        {SidebarNavigationItems.map((item) => {
          if (item.items.length > 0) {
            if (item.isCollapse) {
              return (
                <Sidebar.Collapse
                  key={item.to}
                  label={item.text}
                  icon={item.icon}
                >
                  {item.items.map((innerItem) => {
                    return (
                      <Sidebar.Item
                        key={innerItem.to}
                        to={innerItem.to}
                        as={NavLink}
                        className={
                          location.pathname === innerItem.to ? activeClass : ""
                        }
                      >
                        {innerItem.text}
                      </Sidebar.Item>
                    );
                  })}
                </Sidebar.Collapse>
              );
            }

            return (
              <Sidebar.ItemGroup key={item.to}>
                {item.items.map((innerItem) => {
                  return (
                    <Sidebar.Item
                      key={innerItem.to}
                      to={innerItem.to}
                      icon={innerItem.icon}
                      as={NavLink}
                      className={
                        location.pathname === innerItem.to ? activeClass : ""
                      }
                    >
                      {innerItem.text}
                    </Sidebar.Item>
                  );
                })}
              </Sidebar.ItemGroup>
            );
          }

          return (
            <Sidebar.Item
              icon={item.icon}
              key={item.to}
              to={item.to}
              as={NavLink}
              className={location.pathname === item.to ? activeClass : ""}
            >
              {item.text}
            </Sidebar.Item>
          );
        })}
      </Sidebar.ItemGroup>
    </Sidebar.Items>
  );
};

export default SidebarNav;
