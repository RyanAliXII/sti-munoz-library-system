import HasAccess from "@components/auth/HasAccess";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { Section, Tree } from "@definitions/types";
import { useDeleteCollection } from "@hooks/data-fetching/collection";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Accordion, Button, Table, Tabs } from "flowbite-react";
import { useMemo, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import "react-responsive-modal/styles.css";
import { toast } from "react-toastify";
import AddSectionModal from "./AddSectionModal";
import EditSectionModal from "./EditSectionModal";

type Data = {
  collections: Section[];
  tree: Tree<number, Section>[];
};
const SectionPage = () => {
  const [section, setSection] = useState<Section>({
    isSubCollection: false,
    name: "",
    prefix: "",
    id: 0,
    isDeleteable: false,
    mainCollectionId: 0,
    accessionTable: "",
    isNonCirculating: false,
  });
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
    queryKey: ["sections"],
  });
  const queryClient = useQueryClient();
  const initEdit = (section: Section) => {
    setSection(section);
    openEditModal();
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
      queryClient.invalidateQueries(["sections"]);
      queryClient.invalidateQueries(["sectionsMain"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });

  return (
    <>
      <Container>
        <div className="w-full flex justify-end pb-4 ">
          <HasAccess requiredPermissions={["Collection.Add"]}>
            <Button color="primary" onClick={openAddModal}>
              New Collection
            </Button>
          </HasAccess>
        </div>
      </Container>

      <AddSectionModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
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
