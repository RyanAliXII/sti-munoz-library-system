import CustomSelect from "@components/forms/CustomSelect";
import { Author, ModalProps } from "@definitions/types";
import React, { BaseSyntheticEvent, RefObject, useState } from "react";
import { useContext } from "react";
import Modal from "react-responsive-modal";
import { Nav } from "rsuite";
import "rsuite/dist/rsuite.css";
import { BookAddContext } from "./BookAddContext";
import { PrimaryButton, Input } from "@components/forms/Forms";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
import { MdLastPage } from "react-icons/md";
import { AiOutlineSearch } from "react-icons/ai";
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

  useEffect(() => {
    console.log(modalRef.current);
    modalRef?.current?.addEventListener("scroll", () => {
      console.log("SCROLL");
    });
  }, []);
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
        modal: "w-9/12 rounded h-96",
      }}
    >
      <div>
        <div className="mb-5">
          <span className="text-lg font-semibold mr-2">Author number :</span>
          <span className="text-md">No value</span>
        </div>

        <Nav appearance="tabs">
          <Nav.Item
            active={activeTab === "AUTHORS"}
            onClick={() => {
              setActiveTab("AUTHORS");
            }}
          >
            Generate base on selected authors
          </Nav.Item>
          <Nav.Item
            active={activeTab === "TITLE"}
            onClick={() => {
              setActiveTab("TITLE");
            }}
          >
            Generate base on title
          </Nav.Item>
          <Nav.Item
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
  const { form } = useContext(BookAddContext);
  return (
    <>
      <CustomSelect
        label=""
        options={form.authors.map((author) => ({
          label: `${author.givenName} ${author.surname}`,
          value: author.surname,
        }))}
      ></CustomSelect>
      <PrimaryButton>Generate</PrimaryButton>
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
  const LIMIT = 50;
  const [searchKeyword, setKeyword] = useState("");
  const fetchCuttersTable = async ({ pageParam = 0 }) => {
    try {
      const { data: response } = await axiosClient.get(`/author-numbers/`, {
        params: {
          limit: LIMIT,
          offset: pageParam,
          keyword: searchKeyword,
        },
      });
      return response.data.table ?? [];
    } catch (error) {
      return [];
    }
  };

  const search = () => {
    if (searchKeyword.length === 0) return;
    refetch();
  };
  const { data, fetchNextPage, refetch } = useInfiniteQuery<AuthorNumber[]>({
    queryFn: fetchCuttersTable,
    queryKey: ["authorNumbers"],
    getNextPageParam: (_, allPages) => {
      return allPages.length * OFFSET_INCREMENT;
    },
  });

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

  return (
    <div>
      <div className="flex gap-2 items-center h-42 mb-3">
        <Input
          onChange={(event) => {
            setKeyword(event.target.value);
          }}
          type="text"
          placeholder="Search..."
          wrapperclass="flex items-center w-96"
        ></Input>
        <PrimaryButton type="button" onClick={search}>
          <AiOutlineSearch />
        </PrimaryButton>
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
            return authorNumbers?.map((authorNumber) => {
              return (
                <BodyRow key={authorNumber.surname}>
                  <Td>{authorNumber.id}</Td>
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
