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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";
import { PersonAuthor } from "@definitions/types";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { ErrorMsg } from "@definitions/var";
import { EDIT_AUTHOR_INITIAL_FORM } from "../AuthorPage";
import { useSwitch } from "@hooks/useToggle";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import EditAuthorModal from "./EditPersonAuthorModal";
import AddAuthorModal from "./AddPersonModal";
import { PrimaryButton } from "@components/ui/button/Button";
import axios from "axios";
import { useRequest } from "@hooks/useRequest";
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
  const fetchAuthors = async () => {
    try {
      const { data: response } = await Get("/authors/");
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
  const { data: authors } = useQuery<PersonAuthor[]>({
    queryFn: fetchAuthors,
    queryKey: ["authors"],
  });
  return (
    <>
      <ContainerNoBackground className="flex gap-2">
        <div className="w-full">
          <PrimaryButton onClick={openAddModal}> New Author</PrimaryButton>
        </div>
      </ContainerNoBackground>
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
        <AddAuthorModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
        <EditAuthorModal
          isOpen={isEditModalOpen}
          formData={selectedRow}
          closeModal={closeEditModal}
        />

        <DangerConfirmDialog
          close={closeConfirmDialog}
          isOpen={isConfirmDialogOpen}
          title="Delete Author"
          text="Are you sure that you want to delete this author?"
          onConfirm={onConfirmDialog}
        />
      </Container>
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
        <AiOutlineEdit
          className="cursor-pointer text-yellow-400 text-xl"
          onClick={openEditModal}
        />
        <AiOutlineDelete
          className="cursor-pointer text-orange-600  text-xl"
          onClick={openDialog}
        />
      </Td>
    </BodyRow>
  );
};

export default PersonAsAuthor;
