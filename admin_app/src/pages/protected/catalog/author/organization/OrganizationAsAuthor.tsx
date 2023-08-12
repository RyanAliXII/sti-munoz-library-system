import { ButtonClasses, PrimaryButton } from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { useSwitch } from "@hooks/useToggle";
import AddOrganizationModal from "./AddOrganizationModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Organization } from "@definitions/types";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useState } from "react";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import EditOrganizationModal from "./EditOrganizationModal";
import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";
import LoadingBoundary, {
  LoadingBoundaryV2,
} from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import Tippy from "@tippyjs/react";
import usePaginate from "@hooks/usePaginate";
import ReactPaginate from "react-paginate";

const OrganizationAsAuthor = () => {
  const [selectedRow, setSelectedRow] = useState<Organization>({
    id: 0,
    name: "",
  });
  const { close, isOpen, open } = useSwitch();
  const {
    close: closeConfirmDialog,
    isOpen: isConfirmDialogOpen,
    open: openConfirmDialog,
  } = useSwitch();

  const {
    close: closeEditModal,
    isOpen: isEditModalOpen,
    open: openEditModal,
  } = useSwitch();
  const { Get, Delete } = useRequest();
  const {
    currentPage,
    nextPage,
    previousPage,
    totalPages,
    setCurrentPage,
    setTotalPages,
  } = usePaginate({
    initialPage: 1,
    numberOfPages: 0,
  });
  const fetchOrganizations = async () => {
    try {
      const { data: response } = await Get(
        "/authors/organizations",
        {
          params: {
            page: currentPage,
          },
        },

        [apiScope("Author.Read")]
      );
      setTotalPages(response?.data?.metaData?.pages ?? 0);
      return response?.data?.organizations || [];
    } catch {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const {
    data: organizations,
    refetch,
    isError,
    isFetching,
  } = useQuery<Organization[]>({
    queryKey: ["organizations", currentPage],
    queryFn: fetchOrganizations,
  });
  const proceedToDelete = () => {
    deleteOrganization.mutate();
  };
  const deleteOrganization = useMutation({
    mutationFn: () =>
      Delete(`/authors/organizations/${selectedRow.id}`, {}, [
        apiScope("Author.Delete"),
      ]),
    onSuccess: () => {
      toast.success("Organization deleted.");
      /*
        validate first if deleted row is the last item from the page
        by checking the current active page rows length
        if the current page is empty then go to previous page
      */
      if (organizations?.length === 1 && totalPages > 1) {
        previousPage();
      } else {
        queryClient.invalidateQueries(["authors"]);
      }
    },
    onError: () => {
      toast.error(ErrorMsg.Delete);
    },
    onSettled: () => {
      closeConfirmDialog();
      refetch();
    },
  });
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center";
  return (
    <>
      <ContainerNoBackground className="flex gap-2">
        <div className="w-full">
          <HasAccess requiredPermissions={["Author.Add"]}>
            <PrimaryButton
              onClick={() => {
                open();
              }}
            >
              New Organization
            </PrimaryButton>
          </HasAccess>
        </div>
      </ContainerNoBackground>
      <LoadingBoundaryV2
        isError={isError}
        isLoading={isFetching}
        contentLoadDelay={150}
      >
        <Container className="lg:px-0">
          <div className="w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Organization</Th>
                  <Th></Th>
                </HeadingRow>
              </Thead>
              <Tbody>
                {organizations?.map((org) => {
                  return (
                    <BodyRow key={org.id}>
                      <Td>{org.name}</Td>
                      <Td className="p-2 flex gap-2 items-center">
                        <HasAccess requiredPermissions={["Author.Edit"]}>
                          <Tippy content="Edit Author">
                            <button
                              className={
                                ButtonClasses.SecondaryOutlineButtonClasslist
                              }
                              onClick={() => {
                                setSelectedRow({ ...org });
                                openEditModal();
                              }}
                            >
                              <AiOutlineEdit className="cursor-pointer  text-xl" />
                            </button>
                          </Tippy>
                        </HasAccess>
                        <HasAccess requiredPermissions={["Author.Delete"]}>
                          <Tippy content="Delete Author">
                            <button
                              className={
                                ButtonClasses.DangerButtonOutlineClasslist
                              }
                              onClick={() => {
                                openConfirmDialog();
                                setSelectedRow({ ...org });
                              }}
                            >
                              <AiOutlineDelete className="cursor-pointer  text-xl" />
                            </button>
                          </Tippy>
                        </HasAccess>
                      </Td>
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        </Container>

        <ContainerNoBackground>
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="border px-3 py-0.5  text-center rounded"
            pageRangeDisplayed={5}
            pageCount={totalPages}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setCurrentPage(selected + 1);
            }}
            className={paginationClass}
            previousLabel="Previous"
            previousClassName="px-2 border text-gray-500 py-1 rounded"
            nextClassName="px-2 border text-blue-500 py-1 rounded"
            renderOnZeroPageCount={null}
            activeClassName="border-none bg-blue-500 text-white rounded"
          />
        </ContainerNoBackground>
      </LoadingBoundaryV2>

      <DangerConfirmDialog
        close={closeConfirmDialog}
        isOpen={isConfirmDialogOpen}
        onConfirm={proceedToDelete}
        title="Delete organization"
        text="Are you sure you want to delete this organization ?"
      ></DangerConfirmDialog>
      <HasAccess requiredPermissions={["Author.Add"]}>
        <AddOrganizationModal
          closeModal={close}
          isOpen={isOpen}
          refetch={() => {
            refetch();
          }}
        />
      </HasAccess>
      <HasAccess requiredPermissions={["Author.Edit"]}>
        <EditOrganizationModal
          closeModal={closeEditModal}
          isOpen={isEditModalOpen}
          formData={selectedRow}
          refetch={() => {
            refetch();
          }}
        />
      </HasAccess>
    </>
  );
};

export default OrganizationAsAuthor;
