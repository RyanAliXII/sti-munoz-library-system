import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import React, { useState } from "react";
import {
  Tbody,
  BodyRow,
  HeadingRow,
  Table,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

import { toast } from "react-toastify";
import { PersonAuthor } from "@definitions/types";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { ErrorMsg } from "@definitions/var";
import { EDIT_AUTHOR_INITIAL_FORM } from "../AuthorPage";
import { useSwitch } from "@hooks/useToggle";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import EditAuthorModal from "./EditPersonAuthorModal";
import AddAuthorModal from "./AddPersonModal";
import { ButtonClasses, PrimaryButton } from "@components/ui/button/Button";
import axios from "axios";
import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import Tippy from "@tippyjs/react";
import ReactPaginate from "react-paginate";
const PersonAsAuthor = () => {
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

  const [selectedRow, setSelectedRow] = useState<PersonAuthor>(
    EDIT_AUTHOR_INITIAL_FORM
  );
  const { Get, Delete } = useRequest();
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(0);
  const fetchAuthors = async () => {
    try {
      const { data: response } = await Get(
        "/authors/",
        {
          params: {
            page: page,
          },
        },
        [apiScope("Author.Read")]
      );
      setPages(response?.data?.metaData?.pages ?? 0);
      return response.data.authors ?? [];
    } catch (error) {
      toast.error(ErrorMsg.Get);
      console.error(error);
      return [];
    }
  };
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => Delete(`/authors/${selectedRow?.id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries(["authors"]);
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
  } = useQuery<PersonAuthor[]>({
    queryFn: fetchAuthors,
    queryKey: ["authors", page],
  });
  return (
    <>
      <HasAccess requiredPermissions={["Author.Add"]}>
        <ContainerNoBackground className="flex gap-2">
          <div className="w-full">
            <PrimaryButton onClick={openAddModal}> New Author</PrimaryButton>
          </div>
        </ContainerNoBackground>
      </HasAccess>
      <LoadingBoundary isError={isError} isLoading={isFetching}>
        <Container>
          <div className="w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Given name</Th>
                  <Th>Middle name/initial</Th>
                  <Th>Surname</Th>
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
          <HasAccess requiredPermissions={["Author.Add"]}>
            <AddAuthorModal
              isOpen={isAddModalOpen}
              closeModal={closeAddModal}
            />
          </HasAccess>
          <HasAccess requiredPermissions={["Author.Edit"]}>
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
      </LoadingBoundary>
      <ContainerNoBackground>
        <ReactPaginate
          nextLabel="Next"
          pageClassName="border px-3 py-1  text-center rounded"
          pageRangeDisplayed={5}
          pageCount={pages}
          onPageChange={({ selected }) => {
            setPage(selected + 1);
          }}
          className="flex gap-2 items-center"
          previousLabel="Previous"
          previousClassName="px-2 border text-blue-500 py-1 rounded"
          nextClassName="px-2 border text-blue-500 py-1 rounded"
          renderOnZeroPageCount={null}
          activeClassName="bg-blue-500 text-white"
        />
      </ContainerNoBackground>
    </>
  );
};

type AuthorTableRowType = {
  author: PersonAuthor;
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
      <Td>{author.givenName}</Td>
      <Td>{author.middleName}</Td>
      <Td>{author.surname}</Td>
      <Td className="p-2 flex gap-2 items-center">
        <HasAccess requiredPermissions={["Author.Edit"]}>
          <Tippy content="Edit Author">
            <button
              className={ButtonClasses.SecondaryOutlineButtonClasslist}
              onClick={openEditModal}
            >
              <AiOutlineEdit className="cursor-pointer  text-xl" />
            </button>
          </Tippy>
        </HasAccess>
        <HasAccess requiredPermissions={["Author.Delete"]}>
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

export default PersonAsAuthor;
