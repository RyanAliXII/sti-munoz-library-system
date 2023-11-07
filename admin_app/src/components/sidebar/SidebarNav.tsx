import { Sidebar, TextInput } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { NavLink } from "react-router-dom";
import { SidebarNavigationItems } from "./SidebarNavigations.definition";
const SidebarNav: FC = function () {
  const [currentPage, setCurrentPage] = useState("");

  useEffect(() => {
    const newPage = window.location.pathname;
    setCurrentPage(newPage);
  }, [setCurrentPage]);

  return (
    <Sidebar aria-label="Sidebar with multi-level dropdown example">
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
  return (
    <Sidebar.Items>
      <Sidebar.ItemGroup>
        {SidebarNavigationItems.map((item) => {
          if (item.items.length > 0) {
            return (
              <Sidebar.Collapse
                key={item.text}
                label={item.text}
                icon={item.icon}
              >
                {item.items.map((innerItem) => {
                  return (
                    <Sidebar.Item
                      key={innerItem.to}
                      to={innerItem.to}
                      as={NavLink}
                    >
                      {innerItem.text}
                    </Sidebar.Item>
                  );
                })}
              </Sidebar.Collapse>
            );
          }

          return <Sidebar.Item key={item.to}>{item.text}</Sidebar.Item>;
        })}
      </Sidebar.ItemGroup>
    </Sidebar.Items>
  );
};

export default SidebarNav;
