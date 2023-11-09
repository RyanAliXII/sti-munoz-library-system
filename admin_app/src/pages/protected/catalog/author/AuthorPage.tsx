import "react-responsive-modal/styles.css";

import Container from "@components/ui/container/Container";

import React, { ChangeEvent, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Author } from "@definitions/types";
import { AiOutlineDelete, AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { toast } from "react-toastify";

import HasAccess from "@components/auth/HasAccess";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import AddAuthorModal from "./AddAuthorModal";
import EditAuthorModal from "./EditAuthorModal";

import Tippy from "@tippyjs/react";

import { CustomInput } from "@components/ui/form/Input";
import { ErrorMsg } from "@definitions/var";

import useDebounce from "@hooks/useDebounce";

import CustomPagination from "@components/pagination/CustomPagination";
import { Button, Table } from "flowbite-react";
import { useSearchParamsState } from "react-use-search-params-state";
export const ADD_AUTHOR_INITIAL_FORM: Omit<Author, "id"> = {
  name: "",
};
export const EDIT_AUTHOR_INITIAL_FORM: Author = {
  id: "",
  name: "",
};
const AuthorPage = () => {
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

  const [selectedRow, setSelectedRow] = useState<Author>(
    EDIT_AUTHOR_INITIAL_FORM
  );
  const { Get, Delete } = useRequest();

  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
  });
  const searchDebounce = useDebounce();
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    searchDebounce(
      () => {
        setFilterParams({ keyword: event.target.value, page: 1 });
      },
      "",
      500
    );
  };
  const fetchAuthors = async () => {
    try {
      const { data: response } = await Get("/authors/", {
        params: {
          page: filterParams?.page,
          keyword: filterParams?.keyword,
        },
      });
      setTotalPages(response?.data?.metaData?.pages ?? 0);
      return response.data.authors ?? [];
    } catch (error) {
      toast.error(ErrorMsg.Get);
      console.error(error);
      return [];
    }
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => Delete(`/authors/${selectedRow?.id}/`, {}),
    onSuccess: () => {
      /*
        validate first if deleted row is the last item from the page
        by checking the current active page rows length
        if the current page is empty then go to previous page
      */

      if (authors?.length === 1 && totalPages > 1) {
        setFilterParams({ page: filterParams?.page - 1 });
      } else {
        queryClient.invalidateQueries(["authors"]);
      }

      toast.success("Author has been deleted.");
    },
    onError: (error) => {
      toast.error(ErrorMsg.Delete);
      console.error(error);
    },
    onSettled: () => {
      closeConfirmDialog();
    },
  });
  const onConfirmDialog = () => {
    mutation.mutate();
  };
  const {
    data: authors,
    isError,
    isFetching,
  } = useQuery<Author[]>({
    queryFn: fetchAuthors,
    queryKey: ["authors", filterParams],
  });
  return (
    <Container>
      <HasAccess requiredPermissions={["Author.Access"]}>
        <div className="w-full flex justify-between py-5">
          <CustomInput
            type="text"
            placeholder="Search Author"
            onChange={handleSearch}
            defaultValue={filterParams?.keyword}
          />
          <Button color="primary" onClick={openAddModal} className="flex">
            <AiOutlinePlus />
            New Author
          </Button>
        </div>
      </HasAccess>

      <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
        <div className="w-full">
          <Table>
            <Table.Head>
              <Table.HeadCell>Author</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {authors?.map((author, index) => (
                <AuthorTableRow
                  author={author}
                  openEditModal={() => {
                    setSelectedRow({ ...author });
                    openEditModal();
                  }}
                  openDialog={() => {
                    setSelectedRow({ ...author });
                    openConfirmDialog();
                  }}
                  key={author.id}
                ></AuthorTableRow>
              ))}
            </Table.Body>
          </Table>
        </div>
        <HasAccess requiredPermissions={["Author.Access"]}>
          <AddAuthorModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
        </HasAccess>
        <HasAccess requiredPermissions={["Author.Access"]}>
          <EditAuthorModal
            isOpen={isEditModalOpen}
            formData={selectedRow}
            closeModal={closeEditModal}
          />
        </HasAccess>
        <DangerConfirmDialog
          close={closeConfirmDialog}
          isOpen={isConfirmDialogOpen}
          title="Delete Author"
          text="Are you sure that you want to delete this author?"
          onConfirm={onConfirmDialog}
        />
      </LoadingBoundaryV2>
      <div className="py-5">
        <CustomPagination
          nextLabel="Next"
          pageRangeDisplayed={5}
          pageCount={totalPages}
          disabledClassName="opacity-60 pointer-events-none"
          onPageChange={({ selected }) => {
            setFilterParams({ page: selected + 1 });
          }}
          forcePage={filterParams?.page - 1}
          isHidden={totalPages <= 1}
          previousLabel="Previous"
        />
      </div>
    </Container>
  );
};

type AuthorTableRowType = {
  author: Author;
  openEditModal: () => void;
  openDialog?: () => void;
};

const AuthorTableRow: React.FC<AuthorTableRowType> = ({
  author,
  openEditModal,
  openDialog,
}) => {
  return (
    <Table.Row>
      <Table.Cell>
        <div className=" font-semibold text-gray-900 dark:text-white">
          {author.name}
        </div>
      </Table.Cell>
      <Table.Cell className="p-2 flex gap-2 items-center">
        <HasAccess requiredPermissions={["Author.Access"]}>
          <Tippy content="Edit Author">
            <Button size="xs" color="secondary" onClick={openEditModal}>
              <AiOutlineEdit className="cursor-pointer  text-xl" />
            </Button>
          </Tippy>
        </HasAccess>
        <HasAccess requiredPermissions={["Author.Access"]}>
          <Tippy content="Delete Author">
            <Button size="xs" color="failure" onClick={openDialog}>
              <AiOutlineDelete className="cursor-pointer  text-xl" />
            </Button>
          </Tippy>
        </HasAccess>
      </Table.Cell>
    </Table.Row>
  );
};

export default AuthorPage;
