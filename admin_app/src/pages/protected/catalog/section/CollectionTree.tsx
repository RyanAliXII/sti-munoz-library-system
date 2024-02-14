import { Section, Tree } from "@definitions/types";
import { FC } from "react";

type CollectionTreeData = {
  tree: Tree<number, Section>;
};
const CollectionTree: FC<CollectionTreeData> = ({ tree }) => {
  return (
    <ul className="tree">
      <li>
        <details open>
          <summary>{tree.name}</summary>
          {tree.children.map((t) => {
            return (
              <li className="pl-2 pt-2" key={t.id}>
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
