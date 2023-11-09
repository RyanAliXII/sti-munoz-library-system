import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { ButtonClasses } from "@components/ui/button/Button";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { CustomInput } from "@components/ui/form/Input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { toast } from "react-toastify";

import HasAccess from "@components/auth/HasAccess";
import CustomPagination from "@components/pagination/CustomPagination";
import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { Publisher } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { useSearchParamsState } from "react-use-search-params-state";
import AddPublisherModal from "./AddPublisherModal";
import EditPublisherModal from "./EditPublisherModal";
const PUBLISHER_FORM_DEFAULT_VALUES = { name: "" };
const PublisherPage = () => {
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
  const {
    isOpen: isConfirmDialogOpen,
    open: openConfirmDialog,
    close: closeConfirmDialog,
  } = useSwitch();

  const [selectedRow, setSelectedRow] = useState<Publisher>(
    PUBLISHER_FORM_DEFAULT_VALUES
  );
  const { Get, Delete } = useRequest();

  const searchDebounce = useDebounce();
  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
  });
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    searchDebounce(
      () => {
        setFilterParams({
          page: 1,
          keyword: event.target.value,
        });
      },
      "",
      500
    );
  };
  const fetchPublisher = async () => {
    try {
      const { data: response } = await Get("/publishers/", {
        params: {
          page: filterParams?.page,
          keyword: filterParams?.keyword,
        },
      });
      setTotalPages(response?.data?.metaData?.pages);
      return response?.data?.publishers || [];
    } catch (error) {
      toast.error(ErrorMsg.Get);
    }
    return [];
  };
  const queryClient = useQueryClient();
  const deletePublisher = useMutation({
    mutationFn: () => Delete(`/publishers/${selectedRow.id}/`, {}, []),
    onSuccess: () => {
      if (publishers?.length === 1 && totalPages > 1) {
        setFilterParams({ page: filterParams?.page - 1 });
      } else {
        queryClient.invalidateQueries(["publishers"]);
      }

      toast.success("Publisher deleted.");
    },
    onError: (error) => {
      console.error(error);
      toast.error(ErrorMsg.Delete);
    },
    onSettled: () => {
      closeConfirmDialog();
    },
  });
  const onConfirmDialog = () => {
    deletePublisher.mutate();
  };

  const {
    data: publishers,
    isFetching,
    isError,
  } = useQuery<Publisher[]>({
    queryFn: fetchPublisher,
    queryKey: ["publishers", filterParams],
  });

  return (
    <>
      <Container>
        <div className="flex justify-between py-5">
          <CustomInput
            type="text"
            placeholder="Search Publishers"
            onChange={handleSearch}
            defaultValue={filterParams?.keyword}
          />
          <Button color="primary" onClick={openAddModal}>
            <div className="flex gap-1 items-center">
              <AiOutlinePlus />
              <span>New Publisher</span>
            </div>
          </Button>
        </div>
        <LoadingBoundaryV2
          isLoading={isFetching}
          isError={isError}
          contentLoadDelay={150}
        >
          <TableContainer>
            <Table>
              <Table.Head>
                <Table.HeadCell>Publisher</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {publishers?.map((publisher) => {
                  return (
                    <Table.Row key={publisher.id}>
                      <Table.Cell>
                        <div className="text-gray-900 dark:text-white font-semibold">
                          {publisher.name}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <HasAccess requiredPermissions={["Publisher.Access"]}>
                            <Tippy content="Edit">
                              <Button
                                size="xs"
                                color="secondary"
                                onClick={() => {
                                  setSelectedRow({ ...publisher });
                                  openEditModal();
                                }}
                              >
                                <AiOutlineEdit className="cursor-pointer  text-xl" />
                              </Button>
                            </Tippy>
                          </HasAccess>
                          <HasAccess requiredPermissions={["Publisher.Access"]}>
                            <Tippy content="Delete">
                              <Button
                                size="xs"
                                color="failure"
                                onClick={() => {
                                  openConfirmDialog();
                                  setSelectedRow({ ...publisher });
                                }}
                              >
                                <AiOutlineDelete className="cursor-pointer  text-xl" />
                              </Button>
                            </Tippy>
                          </HasAccess>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </TableContainer>

          <CustomPagination
            nextLabel="Next"
            pageRangeDisplayed={5}
            pageCount={totalPages}
            forcePage={filterParams?.page - 1}
            onPageChange={({ selected }) => {
              setFilterParams({ page: selected + 1 });
            }}
            isHidden={totalPages <= 1}
            previousLabel="Previous"
            renderOnZeroPageCount={null}
          />
        </LoadingBoundaryV2>
      </Container>

      <HasAccess requiredPermissions={["Publisher.Access"]}>
        <AddPublisherModal closeModal={closeAddModal} isOpen={isAddModalOpen} />
      </HasAccess>
      <HasAccess requiredPermissions={["Publisher.Access"]}>
        <EditPublisherModal
          closeModal={closeEditModal}
          isOpen={isEditModalOpen}
          formData={selectedRow}
        />
      </HasAccess>
      <DangerConfirmDialog
        close={closeConfirmDialog}
        isOpen={isConfirmDialogOpen}
        title="Delete Publisher"
        text="Are you sure you want to delete this publisher?"
        onConfirm={onConfirmDialog}
      ></DangerConfirmDialog>
    </>
  );
};

export default PublisherPage;
