import HasAccess from "@components/auth/HasAccess";
import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { Section, Tree } from "@definitions/types";
import { useDeleteCollection } from "@hooks/data-fetching/collection";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Tabs } from "flowbite-react";
import { useState } from "react";
import "react-responsive-modal/styles.css";
import { toast } from "react-toastify";
import AddSectionModal from "./AddSectionModal";
import CollectionTableView from "./CollectionTableView";
import CollectionTreeView from "./CollectionTreeView";
import EditSectionModal from "./EditSectionModal";
import { FaTable } from "react-icons/fa";
import { MdOutlineAccountTree } from "react-icons/md";

type Data = {
  collections: Section[];
  tree: Tree<number, Section>[];
};
enum TabSelections {
  TableView = 0,
  TreeView = 1,
}
const SectionPage = () => {
  const INITIAL_COLLECTION = {
    isSubCollection: false,
    name: "",
    prefix: "",
    id: 0,
    isDeleteable: false,
    mainCollectionId: 0,
    accessionTable: "",
    isNonCirculating: false,
  };
  const [section, setSection] = useState<Section>({ ...INITIAL_COLLECTION });
  const {
    isOpen: isAddModalOpen,
    open: openAddModal,
    close: closeAddModal,
  } = useSwitch();

  const {
    isOpen: isEditModalOpen,
    open: openEditModal,
    close: closeEditModal,
  } = useSwitch();
  const { Get } = useRequest();
  const fetchSections = async () => {
    try {
      const { data: response } = await Get("/sections/", {});
      return {
        collections: response?.data?.sections ?? [],
        tree: response?.data?.tree ?? [],
      };
    } catch (error) {
      console.error(error);
      return {
        collections: [],
        tree: [],
      };
    }
  };

  const { data, isLoading, isError } = useQuery<Data, unknown, Data>({
    queryFn: fetchSections,
    queryKey: ["collectionsData"],
  });
  const queryClient = useQueryClient();
  const initEdit = (section: Section) => {
    setSection(section);
    openEditModal();
  };
  const initEditInTree = (section: Section) => {
    setSection(section);
  };
  const deleteConfirm = useSwitch();
  const initDelete = (section: Section) => {
    setSection(section);
    deleteConfirm.open();
  };
  const onConfirmDelete = () => {
    deleteCollection.mutate(section.id ?? 0);
    deleteConfirm.close();
  };
  const deleteCollection = useDeleteCollection({
    onSuccess: () => {
      toast.success("Collection deleted.");
      queryClient.invalidateQueries(["collectionsData"]);
      queryClient.invalidateQueries(["sectionsMain"]);
      resetSelectedCollection();
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const resetSelectedCollection = () => {
    setSection({ ...INITIAL_COLLECTION });
  };
  const [activeTab, setActiveTab] = useState(() => {
    const tab = parseInt(localStorage.getItem("collectionTab") ?? "");
    if (!tab) return 0;
    if (isNaN(tab)) return 0;
    return tab;
  });
  return (
    <>
      <Container>
        <div className="w-full flex justify-end">
          <HasAccess requiredPermissions={["Collection.Add"]}>
            <Button color="primary" onClick={openAddModal}>
              New Collection
            </Button>
          </HasAccess>
        </div>
        <Tabs.Group
          style="underline"
          onActiveTabChange={(tab) => {
            if (tab == TabSelections.TreeView) {
              resetSelectedCollection();
            }
            setActiveTab(tab);
            localStorage.setItem("collectionTab", tab.toString());
          }}
        >
          <Tabs.Item
            active={activeTab === TabSelections.TableView}
            title={<FaTable className="text-xl" />}
            color="primary"
          >
            <CollectionTableView
              isLoading={isLoading}
              isError={isError}
              collections={data?.collections ?? []}
              initDelete={initDelete}
              initEdit={initEdit}
            />
          </Tabs.Item>
          <Tabs.Item
            active={activeTab === TabSelections.TreeView}
            title={<MdOutlineAccountTree className="text-xl" />}
          >
            <CollectionTreeView
              collection={section}
              initEdit={initEditInTree}
              initDelete={initDelete}
              tree={data?.tree ?? []}
            />
          </Tabs.Item>
        </Tabs.Group>
      </Container>

      <AddSectionModal
        collections={data?.collections ?? []}
        isOpen={isAddModalOpen}
        closeModal={closeAddModal}
      />
      <EditSectionModal
        formData={section}
        isOpen={isEditModalOpen}
        closeModal={closeEditModal}
      />
      <DangerConfirmDialog
        title="Delete Collection"
        text="Are you sure you want to delete collection?"
        close={deleteConfirm.close}
        isOpen={deleteConfirm.isOpen}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default SectionPage;
