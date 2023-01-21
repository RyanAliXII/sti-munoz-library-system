import { Author, AuthorNumber } from "@definitions/types";

import { useBookAddFormContext } from "../BookAddFormContext";
import { Input, PrimaryButton } from "@components/forms/Forms";

import axiosClient from "@definitions/configs/axios";

import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";

const GenerateTab = () => {
  const {
    form,
    setFieldValue,
    removeFieldError,
    selectAuthorForAuthorNumberGeneration,
    authorFromGeneratedAuthorNumber,
    removeAuthorAsBasisForAuthorNumber,
    setAuthorNumberFromSelection,
  } = useBookAddFormContext();
  const generateByTitle = async () => {
    removeAuthorAsBasisForAuthorNumber(); // remove selected author check mark if there is any.
    const { data: response } = await axiosClient.get(
      "/author-numbers/generator",
      {
        params: {
          title: form.title,
        },
      }
    );

    const authorNumber: AuthorNumber = response.data.authorNumber;
    if (authorNumber) {
      if (!authorNumber?.number || !authorNumber?.surname) {
        return;
      }
    }
    setFieldValue(
      "authorNumber",
      `${authorNumber.surname.charAt(0)}${authorNumber.number}`
    );
    setAuthorNumberFromSelection(authorNumber);
    removeFieldError("authorNumber.value");
  };
  const generateAuthorNumberByAuthor = async (author: Author) => {
    selectAuthorForAuthorNumberGeneration(author);
    const { data: response } = await axiosClient.get(
      "/author-numbers/generator",
      {
        params: {
          givenName: author.givenName,
          surname: author.surname,
        },
      }
    );
    const authorNumber: AuthorNumber = response.data.authorNumber;
    if (authorNumber) {
      if (!authorNumber?.number || !authorNumber?.surname) {
        return;
      }
    }
    setFieldValue(
      "authorNumber",
      `${authorNumber.surname.charAt(0)}${authorNumber.number}`
    );
    setAuthorNumberFromSelection(authorNumber);
    removeFieldError("authorNumber");
  };

  const TITLE_CHARACTER_LIMIT = 25;
  const title =
    form.title.length > 25
      ? `${form.title.substring(0, TITLE_CHARACTER_LIMIT)}...`
      : form.title;
  return (
    <>
      <div>
        <div className="w-full mb-3">
          <Input
            label="Author Number"
            wrapperclass="flex items-center"
            className="disabled:bg-gray-100"
            type="text"
            readOnly
            disabled
            value={form.authorNumber}
          />
        </div>
        <div className="lg:grid lg:grid-cols-9 lg:gap-2 ">
          <div className="flex justify-end mb-3 flex-col h-20 lg:h-24 lg:mb-0 lg:col-span-2 lg:justify-center">
            <div className="h-7 flex items-center gap-2">
              <label className=" text-sm font-semibold text-gray-600 ml-1 ">
                <span className="font-semi">
                  {title.length > 0 ? title : "NO TITLE"}
                </span>
              </label>
            </div>
            <div>
              <small className="text-gray-500 pr-5 ml-1">
                Generate author number based on the book title.
              </small>
            </div>
          </div>

          <div className="flex items-center h-20 lg:h-24 col-span-7 gap-2">
            <PrimaryButton
              type="button"
              onClick={generateByTitle}
              className="w-28 lg:w-36 disabled:bg-blue-200"
              disabled={title.length === 0}
            >
              Generate
            </PrimaryButton>
          </div>
        </div>
      </div>
      <hr></hr>
      {form.authors.length === 0 ? (
        <div className="h-80 w-full flex items-center justify-center flex-col">
          <small className="text-sm text-gray-400 ">
            You have not selected any authors. Please select one to generate.
          </small>
          <a className="text-sm text-gray-400 underline cursor-pointer">
            Select an author
          </a>
        </div>
      ) : (
        <>
          <div className="mt-5 mb-4">
            <span className="text-md ml-1 text-gray-500 text-sm"></span>
          </div>
          <Table className="w-full">
            <Thead className=" sticky top-0">
              <HeadingRow>
                <Th></Th>
                <Th>Given name</Th>
                <Th>Middle name/initial</Th>
                <Th>Surname</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {form.authors.map((author) => {
                return (
                  <BodyRow
                    className="cursor-pointer"
                    key={author.id}
                    onClick={() => {
                      generateAuthorNumberByAuthor(author);
                    }}
                  >
                    <Td>
                      <Input
                        wrapperclass="flex items-center h-4"
                        type="checkbox"
                        readOnly
                        checked={
                          authorFromGeneratedAuthorNumber?.id === author.id
                        }
                      ></Input>
                    </Td>
                    <Td>{author.givenName}</Td>
                    <Td>{author.middleName}</Td>
                    <Td>{author.surname}</Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </>
      )}
    </>
  );
};

export default GenerateTab;
