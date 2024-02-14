import { Section, Tree } from "@definitions/types";
import React, { FC } from "react";
import CollectionTree from "./CollectionTree";

type CollectionTreeViewProps = {
  tree: Tree<number, Section>[];
};
const CollectionTreeView: FC<CollectionTreeViewProps> = ({ tree }) => {
  return (
    <div className="flex w-full gap-2 flex-1">
      <div>
        <h1 className="text-xl py-2 dark:text-white">
          Collection Relationships
        </h1>
        {tree.map((t) => {
          return <CollectionTree tree={t} key={t.id} />;
        })}
      </div>
      <div className="flex-1"></div>
    </div>
  );
};

export default CollectionTreeView;
