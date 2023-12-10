import LoadingBoundary from "@components/loader/LoadingBoundary";
import Container from "@components/ui/container/Container";
import { Audit } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AiOutlineEdit, AiOutlinePlus, AiOutlineScan } from "react-icons/ai";
import { Link } from "react-router-dom";

import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import EditAuditModal from "./EditAuditModal";
import NewAuditModal from "./NewAuditModal";
import HasAccess from "@components/auth/HasAccess";

const AuditPage = () => {
  const {
    close: closeNewAuditModal,
    open: openNewAuditModal,
    isOpen: isNewAuditModalOpen,
  } = useSwitch();
  const {
    close: closeEditAuditModal,
    open: openEditAuditModal,
    isOpen: isEditAuditModalOpen,
  } = useSwitch();

  const [editModalFormData, setEditModalFormData] = useState<Audit>({
    name: "",
    id: "",
  });

  const { Get } = useRequest();
  const fetchAudits = async () => {
    try {
      const { data: response } = await Get("/inventory/audits", {});
      return response?.data?.audits ?? [];
    } catch {
      return [];
    }
  };
  const {
    data: audits,
    isFetching,
    isError,
  } = useQuery<Audit[]>({
    queryFn: fetchAudits,
    queryKey: ["audits"],
  });
  return (
    <>
      <Container>
        <LoadingBoundary isLoading={isFetching} isError={isError}>
          <div className="flex justify-end w-full py-4">
            <HasAccess requiredPermissions={["Audit.Access"]}>
              <Button color="primary" onClick={openNewAuditModal}>
                <div className="flex gap-2">
                  <AiOutlinePlus />
                  <span>New Audit</span>
                </div>
              </Button>
            </HasAccess>
          </div>
          <Table>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y dark:divide-gray-700">
              {audits?.map((audit) => {
                return (
                  <Table.Row key={audit.id}>
                    <Table.Cell>{audit.name}</Table.Cell>
                    <Table.Cell className="flex gap-2">
                      <HasAccess requiredPermissions={["Audit.Access"]}>
                        <Tippy content="Scan Books">
                          <Link to={`/inventory/audits/${audit.id}`}>
                            <Button size="xs" color="primary">
                              <AiOutlineScan className=" text-lg cursor-pointer"></AiOutlineScan>
                            </Button>
                          </Link>
                        </Tippy>
                        <Tippy content="Edit">
                          <Button
                            size="xs"
                            color="secondary"
                            onClick={() => {
                              setEditModalFormData({ ...audit });
                              openEditAuditModal();
                            }}
                          >
                            <AiOutlineEdit className=" text-lg cursor-pointer"></AiOutlineEdit>
                          </Button>
                        </Tippy>
                      </HasAccess>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </LoadingBoundary>
      </Container>
      <NewAuditModal
        closeModal={closeNewAuditModal}
        isOpen={isNewAuditModalOpen}
      ></NewAuditModal>
      <EditAuditModal
        closeModal={closeEditAuditModal}
        isOpen={isEditAuditModalOpen}
        formData={editModalFormData}
      ></EditAuditModal>
    </>
  );
};

export default AuditPage;
