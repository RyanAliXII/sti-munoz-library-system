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
import { toast } from "react-toastify";
import useCutter from "@hooks/use-cutter/useCutter";
import { useState } from "react";

const GenerateTab = () => {
  const { form, setFieldValue, removeFieldError } = useBookAddFormContext();
  const generateAuthorNumber = useCutter();
  const generateByTitle = async () => {
    const authorNumber = generateAuthorNumber(form.title);
    setFieldValue("authorNumber", authorNumber);
    removeFieldError("authorNumber");
    toast.info("Author number has been generated for title.");
  };
  const generateAuthorNumberByAuthor = async (name: string) => {
    const authorNumber = generateAuthorNumber(name);
    setFieldValue("authorNumber", authorNumber);
    removeFieldError("authorNumber");
    toast.info("Author number has been generated for author");
  };
  const generateAuthorNumberByText = async () => {
    const authorNumber = generateAuthorNumber(text);
    setFieldValue("authorNumber", authorNumber);
    removeFieldError("authorNumber");
    toast.info("Author number has been generated for author");
  };
  const [text, setText] = useState("");
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
        <div className="lg:grid lg:grid-cols-9 lg:gap-2 ">
          <div className="flex justify-end mb-3 flex-col h-20 lg:h-24 lg:mb-0 lg:col-span-2 lg:justify-center">
            <div>
              <Input
                type="text"
                label="Generate based on the text you have given."
                onChange={(event) => {
                  setText(event.target.value);
                }}
                value={text}
              />
            </div>
          </div>

          <div className="flex items-center h-20 lg:h-24 col-span-7 gap-2">
            <PrimaryButton
              type="button"
              onClick={generateAuthorNumberByText}
              className="w-28 lg:w-36 disabled:bg-blue-200 mt-1"
              disabled={text.length === 0}
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
                {/* <Th></Th> */}
                <Th>Author</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {form.authors.map((author) => {
                return (
                  <BodyRow
                    className="cursor-pointer"
                    key={author.id}
                    onClick={() => {
                      generateAuthorNumberByAuthor(author.name);
                    }}
                  >
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
