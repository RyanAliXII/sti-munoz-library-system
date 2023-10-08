import "react-responsive-modal/styles.css";

import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Tbody,
  BodyRow,
  HeadingRow,
  Table,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";
import { Author } from "@definitions/types";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

import { useSwitch } from "@hooks/useToggle";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import EditAuthorModal from "./EditAuthorModal";
import AddAuthorModal from "./AddPersonModal";
import { ButtonClasses, PrimaryButton } from "@components/ui/button/Button";
import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import Tippy from "@tippyjs/react";
import ReactPaginate from "react-paginate";
import usePaginate from "@hooks/usePaginate";
import { ErrorMsg } from "@definitions/var";
import { Input } from "@components/ui/form/Input";
import { useSearchParams } from "react-router-dom";
import useDebounce from "@hooks/useDebounce";
import useSearch from "@hooks/useSearch";

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
  const [params, _] = useSearchParams();
  const { keyword, setKeyword } = useSearch({ initialKeyword: "" });
  const {
    currentPage,
    totalPages,
    setTotalPages,
    previousPage,
    setCurrentPage,
  } = usePaginate({
    initialPage: 1,
    numberOfPages: 1,
  });

  const searchDebounce = useDebounce();
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    searchDebounce(
      () => {
        setKeyword(event.target.value);
        setCurrentPage(1);
      },
      "",
      500
    );
  };
  const fetchAuthors = async () => {
    try {
      const { data: response } = await Get(
        "/authors/",
        {
          params: {
            page: currentPage,
            keyword: keyword,
          },
        },
        [apiScope("Author.Read")]
      );
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
    mutationFn: () =>
      Delete(`/authors/${selectedRow?.id}/`, {}, [apiScope("Author.Delete")]),
    onSuccess: () => {
      /*
        validate first if deleted row is the last item from the page
        by checking the current active page rows length
        if the current page is empty then go to previous page
      */

      if (authors?.length === 1 && totalPages > 1) {
        previousPage();
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
    queryKey: ["authors", currentPage, keyword],
  });
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center";

  return (
    <>
      <HasAccess requiredPermissions={["Author.Access"]}>
        <ContainerNoBackground className="flex gap-2">
          <div className="w-full">
            <PrimaryButton onClick={openAddModal}> New Author</PrimaryButton>
          </div>
        </ContainerNoBackground>
      </HasAccess>
      <ContainerNoBackground>
        <Input
          type="text"
          placeholder="Search Author"
          onChange={handleSearch}
          defaultValue={keyword}
        />
      </ContainerNoBackground>
      <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
        <Container>
          <div className="w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Author</Th>
                  <Th></Th>
                </HeadingRow>
              </Thead>

              <Tbody>
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
              </Tbody>
            </Table>
          </div>
          <HasAccess requiredPermissions={["Author.Access"]}>
            <AddAuthorModal
              isOpen={isAddModalOpen}
              closeModal={closeAddModal}
            />
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
        </Container>
      </LoadingBoundaryV2>
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
          forcePage={currentPage - 1}
          className={paginationClass}
          previousLabel="Previous"
          previousClassName="px-2 border text-gray-500 py-1 rounded"
          nextClassName="px-2 border text-blue-500 py-1 rounded"
          renderOnZeroPageCount={null}
          activeClassName="border-none bg-blue-500 text-white rounded"
        />
      </ContainerNoBackground>
    </>
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
    <BodyRow>
      <Td>{author.name}</Td>
      <Td className="p-2 flex gap-2 items-center">
        <HasAccess requiredPermissions={["Author.Access"]}>
          <Tippy content="Edit Author">
            <button
              className={ButtonClasses.SecondaryOutlineButtonClasslist}
              onClick={openEditModal}
            >
              <AiOutlineEdit className="cursor-pointer  text-xl" />
            </button>
          </Tippy>
        </HasAccess>
        <HasAccess requiredPermissions={["Author.Access"]}>
          <Tippy content="Delete Author">
            <button
              className={ButtonClasses.DangerButtonOutlineClasslist}
              onClick={openDialog}
            >
              <AiOutlineDelete className="cursor-pointer   text-xl" />
            </button>
          </Tippy>
        </HasAccess>
      </Td>
    </BodyRow>
  );
};

export default AuthorPage;
