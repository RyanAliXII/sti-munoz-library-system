import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import "react-responsive-modal/styles.css";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import Container from "@components/ui/container/Container";
import { Section } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import TableContainer from "@components/ui/table/TableContainer";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import AddSectionModal from "./AddSectionModal";
import EditSectionModal from "./EditSectionModal";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";

const SectionPage = () => {
  const [section, setSection] = useState<Section>({
    isSubCollection: false,
    name: "",
    prefix: "",
    id: 0,
    isDeleteable: false,
    mainCollectionId: 0,
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
      return response.data?.sections ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const {
    data: sections,
    isLoading,
    isError,
  } = useQuery<Section[]>({
    queryFn: fetchSections,
    queryKey: ["sections"],
  });
  const initEdit = (section: Section) => {
    setSection(section);
    openEditModal();
  };

  const deleteConfirm = useSwitch();

  const initDelete = (section: Section) => {
    setSection(section);
    deleteConfirm.open();
  };
  return (
    <>
      <Container>
        <div className="w-full flex justify-end pb-4 ">
          <Button color="primary" onClick={openAddModal}>
            New Section
          </Button>
        </div>
        <LoadingBoundary isLoading={isLoading} isError={isError}>
          <TableContainer>
            <Table>
              <Table.Head>
                <Table.HeadCell>Collection</Table.HeadCell>
                <Table.HeadCell>Sub-collection(Yes/No)</Table.HeadCell>
                <Table.HeadCell>Current Counter</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {sections?.map((section) => {
                  return (
                    <Table.Row key={section.id}>
                      <Table.Cell>
                        <div className=" text-gray-900 dark:text-white font-semibold">
                          {section.name}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {section.isSubCollection ? (
                          <span className="text-green-600"> Yes</span>
                        ) : (
                          <span className="text-gray-600">No</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>{section.lastValue}</Table.Cell>
                      <Table.Cell className="p-2 flex gap-2 items-center">
                        <Tippy content="Edit">
                          <Button
                            onClick={() => {
                              initEdit(section);
                            }}
                            color="secondary"
                            size="xs"
                          >
                            <AiOutlineEdit className="cursor-pointer text-xl" />
                          </Button>
                        </Tippy>
                        {section.isDeleteable && (
                          <Tippy content="Delete">
                            <Button
                              color="failure"
                              size="xs"
                              onClick={() => {
                                initDelete(section);
                              }}
                            >
                              <AiOutlineDelete className="cursor-pointer  text-xl" />
                            </Button>
                          </Tippy>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </TableContainer>
        </LoadingBoundary>
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
      />
    </>
  );
};

export default SectionPage;
