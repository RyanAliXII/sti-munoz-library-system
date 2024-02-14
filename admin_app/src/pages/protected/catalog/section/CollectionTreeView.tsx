import { Section, Tree } from "@definitions/types";
import React, { FC } from "react";
import CollectionTree from "./CollectionTree";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import TreeDataPanel from "./TreeDataPanel";
type CollectionTreeViewProps = {
  tree: Tree<number, Section>[];
  collection: Section;
  initEdit: (e: Section) => void;
  initDelete: (e: Section) => void;
};
const CollectionTreeView: FC<CollectionTreeViewProps> = ({
  tree,
  initEdit,
  collection,
  initDelete,
}) => {
  const onSelect = (collection: Section) => {
    initEdit(collection);
  };
  return (
    <PanelGroup autoSaveId="treeView" direction="horizontal">
      <Panel defaultSize={25}>
        <h5 className="text-xl my-2 dark:text-white">
          Collection Relationships
        </h5>
        {tree.map((t) => {
          return <CollectionTree onSelectNode={onSelect} tree={t} key={t.id} />;
        })}
      </Panel>
      <PanelResizeHandle className="border border-l-0 border-t-0 border-b-0 border-gray-300 dark:border-gray-700 "></PanelResizeHandle>
      <Panel defaultSize={75}>
        <TreeDataPanel initDelete={initDelete} collection={collection} />
      </Panel>
    </PanelGroup>
  );
};

export default CollectionTreeView;
