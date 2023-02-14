import Table, {
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import axiosClient from "@definitions/configs/axios";
import { Author, ModalProps } from "@definitions/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import Modal from "react-responsive-modal";
import { useBookEditFormContext } from "../BookEditFormContext";

interface AuthorSelectionModalProps extends ModalProps {
  selectAuthor?: (a: Author) => void;
  removeAuthor?: (a: Author) => void;
}
const AuthorSelectionModal: React.FC<AuthorSelectionModalProps> = ({
  closeModal,
  isOpen,
  selectAuthor,
  removeAuthor,
}) => {
  const fetchAuthors = async () => {
    try {
      const { data: response } = await axiosClient.get("/authors/");
      return response?.data?.authors ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const { form } = useBookEditFormContext();
  const { data: authors } = useQuery<Author[]>({
    queryFn: fetchAuthors,
    queryKey: ["authors"],
  });

  if (!isOpen) return null;

  const selectedAuthorsCount = form.authors.length;

  return (
    <>
      <Modal
        open={isOpen}
        onClose={closeModal}
        center
        showCloseIcon={false}
        styles={{
          modal: {
            maxWidth: "none",
          },
        }}
        classNames={{
          modal: "lg:w-8/12 rounded  ",
        }}
      >
        <div>
          <div className="mb-3">
            <h3 className="text-2xl"> Authors</h3>
            <small>
              You have selected
              <strong> {selectedAuthorsCount} </strong>
              {selectedAuthorsCount > 1 ? "authors" : "author"}
            </small>
          </div>
          <Table.Table className="w-full border-b-0">
            <Thead>
              <HeadingRow>
                <Th></Th>
                <Th>Given name</Th>
                <Th>Middle name/initial</Th>
                <Th>Surname</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {authors?.map((author) => {
                const isChecked = form.authors.find((a) => a.id === author.id);

                return (
                  <BodyRow
                    key={author.id}
                    className="cursor-pointer"
                    onClick={() => {
                      if (!isChecked) {
                        selectAuthor?.(author);
                      } else {
                        removeAuthor?.(author);
                      }
                    }}
                  >
                    <Td>
                      <input
                        type="checkbox"
                        readOnly
                        checked={isChecked ? true : false}
                        className="h-4 w-4 border"
                      />
                    </Td>
                    <Td>{author.givenName}</Td>
                    <Td>{author.middleName}</Td>
                    <Td>{author.surname}</Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table.Table>
        </div>
      </Modal>
    </>
  );
};

export default AuthorSelectionModal;
