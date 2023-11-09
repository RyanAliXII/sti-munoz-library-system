import { CustomInput } from "@components/ui/form/Input";
import { useBookAddFormContext } from "../BookAddFormContext";

import useCutter from "@hooks/use-cutter/useCutter";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import { toast } from "react-toastify";

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
        <div className="w-full mb-4">
          <CustomInput
            label="Author Number"
            className="disabled:bg-gray-100"
            type="text"
            readOnly
            disabled
            value={form.authorNumber}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <CustomInput
              label="Generate based on book title"
              value={title}
              readOnly={title.length <= 0}
            ></CustomInput>
          </div>
          <Button
            color="primary"
            onClick={generateByTitle}
            disabled={title.length === 0}
          >
            Generate
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <CustomInput
              type="text"
              label="Generate based on the text you have given"
              onChange={(event) => {
                setText(event.target.value);
              }}
              value={text}
            />
          </div>
          <Button
            color="primary"
            type="button"
            onClick={generateAuthorNumberByText}
            disabled={text.length === 0}
          >
            Generate
          </Button>
        </div>
      </div>

      {form.authors.length === 0 ? (
        <div className="h-80 w-full flex items-center justify-center flex-col ">
          <small className="text-sm text-gray-400 ">
            You have not selected any authors. Please select one to generate
            author number.
          </small>
        </div>
      ) : (
        <>
          <Table className="w-full" hoverable>
            <Table.Head className=" sticky top-0">
              <Table.HeadCell>Author</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y dark:divide-gray-700">
              {form.authors.map((author) => {
                return (
                  <Table.Row
                    className="cursor-pointer"
                    key={author.id}
                    onClick={() => {
                      generateAuthorNumberByAuthor(author.name);
                    }}
                  >
                    <Table.Cell>{author.name}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </>
      )}
    </>
  );
};

export default GenerateTab;
