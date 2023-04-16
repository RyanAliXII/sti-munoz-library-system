import { AuthorNumber } from "@definitions/types";

import { useBookAddFormContext } from "../BookAddFormContext";
import { Input } from "@components/ui/form/Input";

import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { PrimaryButton } from "@components/ui/button/Button";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";

const GenerateTab = () => {
  const { form, setFieldValue, removeFieldError } = useBookAddFormContext();
  const { Get } = useRequest();
  const generateByTitle = async () => {
    // remove selected author check mark if there is any.

    const { data: response } = await Get("/author-numbers/generator", {
      params: {
        title: form.title,
      },
    });

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
    removeFieldError("authorNumber");
    toast.info("Author number has been generated for title.");
  };

  const generateAuthorNumberByAuthor = async (
    givenName: string,
    surname: string,
    type: string
  ) => {
    const { data: response } = await Get("/author-numbers/generator", {
      params: {
        givenName: givenName,
        surname: surname,
      },
    });
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

    removeFieldError("authorNumber");
    toast.info("Author number has been generated for author.");
  };

  const TITLE_CHARACTER_LIMIT = 25;
  const title =
    form.title.length > 25
      ? `${form.title.substring(0, TITLE_CHARACTER_LIMIT)}...`
      : form.title;

  const numberOfAuthorSelected =
    form.authors.organizations.length +
    form.authors.people.length +
    form.authors.publishers.length;
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
      {numberOfAuthorSelected === 0 ? (
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
                {/* <Th></Th> */}
                <Th>Author</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {form.authors.people.map((author) => {
                return (
                  <BodyRow
                    className="cursor-pointer"
                    key={author.id}
                    onClick={() => {
                      generateAuthorNumberByAuthor(
                        author.givenName,
                        author.surname,
                        "person"
                      );
                    }}
                  >
                    {/* <Td>
                      <Input
                        wrapperclass="flex items-center h-4"
                        type="checkbox"
                        readOnly
                      ></Input>
                    </Td> */}
                    <Td>{author.givenName}</Td>
                  </BodyRow>
                );
              })}
              {form.authors.organizations.map((author) => {
                return (
                  <BodyRow
                    className="cursor-pointer"
                    key={author.id}
                    onClick={() => {
                      generateAuthorNumberByAuthor("none", author.name, "org");
                    }}
                  >
                    {/* <Td>
                      <Input
                        wrapperclass="flex items-center h-4"
                        type="checkbox"
                        readOnly
                      ></Input>
                    </Td> */}
                    <Td>{author.name}</Td>
                  </BodyRow>
                );
              })}

              {form.authors.publishers.map((author) => {
                return (
                  <BodyRow
                    className="cursor-pointer"
                    key={author.id}
                    onClick={() => {
                      generateAuthorNumberByAuthor(
                        "none",
                        author.name,
                        "publisher"
                      );
                    }}
                  >
                    {/* <Td>
                      <Input
                        wrapperclass="flex items-center h-4"
                        type="checkbox"
                        readOnly
                      ></Input>
                    </Td> */}
                    <Td>{author.name}</Td>
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
