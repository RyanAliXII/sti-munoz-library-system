import "@assets/css/tree.css";
import { Section, Tree } from "@definitions/types";
import { BaseSyntheticEvent, FC, useState } from "react";
type CollectionTreeData = {
  tree: Tree<number, Section>;
  onSelectNode?: (collection: Section) => void;
};
const CollectionTree: FC<CollectionTreeData> = ({ tree, onSelectNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const handleClick = (event: BaseSyntheticEvent, collection: Section) => {
    const tag = event.target.tagName;
    if (tag === "BUTTON") {
      setIsOpen((prev) => !prev);
    }
    if (tag === "A") {
      onSelectNode?.(collection);
    }
    event.preventDefault();
  };
  return (
    <ul className="tree">
      <li>
        <details open={isOpen} className="cursor-pointer">
          <summary
            className="cursor-pointer flex items-center gap-1"
            onClick={(event) => {
              handleClick(event, tree.data);
            }}
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
                <CollectionTree onSelectNode={onSelectNode} tree={t} />
              </li>
            );
          })}
        </details>
      </li>
    </ul>
  );
};

export default CollectionTree;
