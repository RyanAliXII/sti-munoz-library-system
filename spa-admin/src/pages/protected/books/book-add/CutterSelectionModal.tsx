import { Author, AuthorNumber, ModalProps } from "@definitions/types";
import React, { useId, useState } from "react";
import Modal from "react-responsive-modal";
import { useBookAddContext } from "./BookAddContext";
import { Input, PrimaryButton } from "@components/forms/Forms";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

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
import { useRef } from "react";
import { useEffect } from "react";

import useDebounce from "@hooks/useDebounce";

import { SingleValue } from "react-select";

interface CutterSelectionModalProps extends ModalProps {
  selectedAuthors: Author[];
}

enum Tabs {
  Generate = "GENERATE",
  Browse = "BROWSE",
}
enum Classes {
  Active = "inline-block p-4 text-blue-400 bg-gray-100 rounded-t-lg active cursor-pointer",
  Default = "inline-block p-4 text-gray-400  rounded-t-lg cursor-pointer",
}

const checkActive = (key: string, state: string) => {
  if (key === state) {
    return Classes.Active;
  }
  return Classes.Default;
};

const CutterSelectionModal: React.FC<CutterSelectionModalProps> = ({
  closeModal,
  isOpen,
  selectedAuthors,
}) => {
  const [activeTab, setActiveTab] = useState<string>("GENERATE");
  const modalRef = useRef<HTMLDivElement>(null);

  const { form } = useBookAddContext();
  if (!isOpen) return null;
  return (
    <Modal
      ref={modalRef}
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      center
      styles={{
        modal: {
          maxWidth: "none",
        },
      }}
      classNames={{
        modalContainer: "",
        modal: "w-11/12 lg:w-9/12 rounded h-[600px]",
      }}
    >
      <div>
        <nav className="mb-6">
          <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 ">
            <li className="mr-2">
              <a
                aria-current="page"
                className={checkActive(Tabs.Generate, activeTab)}
                onClick={() => {
                  setActiveTab(Tabs.Generate);
                }}
              >
                GENERATE
              </a>
            </li>
            <li className="mr-2">
              <a
                aria-current="page"
                className={checkActive(Tabs.Browse, activeTab)}
                onClick={() => {
                  setActiveTab(Tabs.Browse);
                }}
              >
                BROWSE
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <TabContent activeTab={activeTab}></TabContent>
    </Modal>
  );
};

interface TabsContentProps {
  activeTab: string;
}
const TabContent = ({ activeTab }: TabsContentProps) => {
  switch (activeTab) {
    case Tabs.Generate:
      return <GenerateTab />;
    case Tabs.Browse:
      return <BrowseTab />;
    default:
      return <></>;
  }
};

const GenerateTab = () => {
  const {
    form,
    setForm,
    authorGeneratedFrom,
    setGeneratedFrom,
    resetGeneratedFrom,
  } = useBookAddContext();
  const generateByTitle = async () => {
    resetGeneratedFrom();
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
    setForm((prevForm) => ({
      ...prevForm,
      authorNumber: {
        number: authorNumber.number,
        surname: authorNumber.surname,
        value: `${authorNumber.surname.charAt(0)}${authorNumber.number}`,
      },
    }));
  };
  const selectAuthor = async (author: Author) => {
    setGeneratedFrom(author);
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
    setForm((prevForm) => ({
      ...prevForm,
      authorNumber: {
        number: authorNumber.number,
        surname: authorNumber.surname,
        value: `${authorNumber.surname.charAt(0)}${authorNumber.number}`,
      },
    }));
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
            value={form.authorNumber.value}
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
                    key={author.id ?? useId()}
                    onClick={() => {
                      selectAuthor(author);
                    }}
                  >
                    <Td>
                      <Input
                        wrapperclass="flex items-center h-4"
                        type="checkbox"
                        readOnly
                        checked={authorGeneratedFrom?.id === author.id}
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

const BrowseTab = () => {
  const OFFSET_INCREMENT = 50;

  const { form, setForm } = useBookAddContext();
  const [searchKeyword, setKeyword] = useState("");
  const fetchCuttersTable = async ({ pageParam = 0 }) => {
    try {
      const { data: response } = await axiosClient.get(`/author-numbers/`, {
        params: {
          offset: pageParam,
          keyword: searchKeyword,
        },
      });
      return response.data.table ?? [];
    } catch (error) {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const search = () => {
    queryClient.setQueryData(["authorNumbers"], () => {
      return {
        pageParams: [],
        pages: [],
      };
    });
    refetch();
  };
  const { data, fetchNextPage, refetch } = useInfiniteQuery<AuthorNumber[]>({
    queryFn: fetchCuttersTable,
    queryKey: ["authorNumbers"],
    refetchOnWindowFocus: false,
    getNextPageParam: (_, allPages) => {
      return allPages.length * OFFSET_INCREMENT;
    },
  });
  const debounceSearch = useDebounce();
  useEffect(() => {
    const MODAL_CLASS = ".react-responsive-modal-modal";
    const modal = document.querySelector(MODAL_CLASS);
    const listenScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      if (target.scrollTop === target.scrollHeight - target.offsetHeight) {
        fetchNextPage();
      }
    };
    modal?.addEventListener("scroll", listenScroll);
    return () => {
      modal?.removeEventListener("scroll", listenScroll);
    };
  }, []);
  const selectAuthorNumber = (cutter: Omit<AuthorNumber, "id">) => {
    setForm((prevForm) => ({
      ...prevForm,
      authorNumber: {
        number: cutter.number,
        surname: cutter.surname,
        value: `${cutter.surname.charAt(0)}${cutter.number}`,
      },
    }));
  };
  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <div>
          <Input
            label="Author Number"
            wrapperclass="flex items-center"
            className="disabled:bg-gray-100"
            type="text"
            readOnly
            disabled
            value={form.authorNumber.value}
          />
        </div>
        <Input
          wrapperclass="flex items-end h-14 mt-1"
          onChange={(event) => {
            setKeyword(event.target.value);
            debounceSearch(search, {}, 300);
          }}
          type="text"
          placeholder="Search..."
        ></Input>
      </div>

      <Table>
        <Thead>
          <HeadingRow>
            <Th></Th>
            <Th>Surname</Th>
            <Th>Number</Th>
          </HeadingRow>
        </Thead>

        <Tbody>
          {data?.pages.map((authorNumbers) => {
            return authorNumbers?.map((authorNumber, index) => {
              return (
                <BodyRow
                  key={authorNumber.surname}
                  onClick={() => {
                    selectAuthorNumber(authorNumber);
                  }}
                  className="cursor-pointer"
                >
                  <Td>
                    <Input
                      wrapperclass="flex items-center"
                      type="checkbox"
                      className="h-4"
                      readOnly
                      checked={
                        authorNumber.surname === form.authorNumber.surname
                          ? true
                          : false
                      }
                    ></Input>
                  </Td>
                  <Td>{authorNumber.surname}</Td>
                  <Td>{authorNumber.number}</Td>
                </BodyRow>
              );
            });
          })}
        </Tbody>
      </Table>
    </div>
  );
};
export default CutterSelectionModal;
