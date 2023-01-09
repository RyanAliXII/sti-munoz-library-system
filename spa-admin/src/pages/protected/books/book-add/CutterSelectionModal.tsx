import CustomSelect from "@components/forms/CustomSelect";
import { Author, ModalProps } from "@definitions/types";
import React, { useId, useState } from "react";
import { useContext } from "react";
import Modal from "react-responsive-modal";
import { Nav } from "rsuite";

import { BookAddContext } from "./BookAddContext";
import { Input } from "@components/forms/Forms";
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

type Tabs = "AUTHORS" | "TITLE" | "BROWSE";

const CutterSelectionModal: React.FC<CutterSelectionModalProps> = ({
  closeModal,
  isOpen,
  selectedAuthors,
}) => {
  const [activeTab, setActiveTab] = useState<Tabs>("AUTHORS");
  const modalRef = useRef<HTMLDivElement>(null);

  const { form } = useContext(BookAddContext);
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
          height: "600px",
        },
      }}
      classNames={{
        modal: "w-full lg:w-9/12 rounded ",
      }}
    >
      <div>
        <div className="mb-5">
          <span className="text-lg font-semibold mr-2">Author number :</span>
          <span className="text-lg text-gray-500">{`${form.authorNumber.surname} ${form.authorNumber.number}`}</span>
        </div>
        <Nav appearance="tabs" className="flex gap-2 ">
          <Nav.Item
            active={activeTab === "AUTHORS"}
            className="text-sm flex items-center px-2   text-blue-400 "
            onClick={() => {
              setActiveTab("AUTHORS");
            }}
          >
            Generate base on selected authors
          </Nav.Item>
          <Nav.Item
            className="p-5"
            active={activeTab === "TITLE"}
            onClick={() => {
              setActiveTab("TITLE");
            }}
          >
            Generate base on title
          </Nav.Item>
          <Nav.Item
            className="p-5"
            active={activeTab === "BROWSE"}
            onClick={() => {
              setActiveTab("BROWSE");
            }}
          >
            Browse
          </Nav.Item>
        </Nav>
        <br />
      </div>
      <CutterTabs activeTab={activeTab}></CutterTabs>
    </Modal>
  );
};

interface TabsProps {
  activeTab: Tabs;
}
const CutterTabs = ({ activeTab }: TabsProps) => {
  switch (activeTab) {
    case "AUTHORS":
      return <AuthorTab />;
    case "BROWSE":
      return <BrowseTab />;
    default:
      return <></>;
  }
};

const AuthorTab = () => {
  const { form, setForm } = useContext(BookAddContext);
  const handleSelect = async (
    select: SingleValue<{ label: string; value: Author }>
  ) => {
    const { data: response } = await axiosClient.get(
      "/author-numbers/generator",
      {
        params: {
          givenName: select?.value.givenName,
          surname: select?.value.surname,
        },
      }
    );
    const authorNumber: AuthorNumber = response.data.authorNumber;
    if (authorNumber) {
      if (!authorNumber?.number || !authorNumber?.surname) {
        return;
      }
    }
    setForm((prevForm) => ({ ...prevForm, authorNumber: authorNumber }));
  };
  return (
    <>
      <CustomSelect
        onChange={handleSelect}
        options={form.authors.map((author) => ({
          label: `${author.givenName} ${author.surname}`,
          value: author,
        }))}
      ></CustomSelect>

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
          <h2 className="text-lg mb-2">Selected Authors</h2>
          <Table className="w-full">
            <Thead className=" sticky top-0">
              <HeadingRow>
                <Th>Given name</Th>
                <Th>Middle name/initial</Th>
                <Th>Surname</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {form.authors.map((author) => {
                return (
                  <BodyRow key={author.id ?? useId()}>
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

type AuthorNumber = {
  id: number;
  number: number;
  surname: string;
};

const BrowseTab = () => {
  const OFFSET_INCREMENT = 50;

  const { form, setForm } = useContext(BookAddContext);
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
      },
    }));
  };
  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <Input
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
