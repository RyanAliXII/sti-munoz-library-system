import { Section, Tree } from "@definitions/types";
import { BaseSyntheticEvent, FC, MouseEventHandler, useState } from "react";
import "@assets/css/tree.css";
import { Button } from "flowbite-react";
type CollectionTreeData = {
  tree: Tree<number, Section>;
};
const CollectionTree: FC<CollectionTreeData> = ({ tree }) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleClick = (event: BaseSyntheticEvent) => {
    const tag = event.target.tagName;
    if (tag === "BUTTON") {
      setIsOpen((prev) => !prev);
    }
    event.preventDefault();
  };
  return (
    <ul className="tree">
      <li>
        <details open={isOpen} className="cursor-pointer flex">
          <summary
            className="cursor-pointer flex items-center gap-1"
            onClick={handleClick}
          >
            {isOpen ? (
              <button className="px-1 py-0 bg-blue-500 text-white rounded text-xs">
                -
              </button>
            ) : (
              <button className="px-1 py-0 bg-blue-500 text-white rounded text-xs">
                +
              </button>
            )}
            <a
              className="underline underline-offset-4 hover:text-gray-500 dark:text-white dark:hover:text-gray-300"
              role="button"
            >
              {tree.name}
            </a>
          </summary>
          {tree.children.map((t) => {
            return (
              <li className="pl-5 py-1 block" key={t.id}>
                <CollectionTree tree={t} />
              </li>
            );
          })}
        </details>
      </li>
    </ul>
  );
};

export default CollectionTree;
