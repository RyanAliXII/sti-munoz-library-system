import CustomSelect from "@components/forms/CustomSelect";
import { Author, ModalProps } from "@definitions/types";
import React, { RefObject, useState } from "react";
import { useContext } from "react";
import Modal from "react-responsive-modal";
import { Nav } from "rsuite";
import "rsuite/dist/rsuite.css";
import { BookAddContext } from "./BookAddContext";
import { PrimaryButton, Input } from "@components/forms/Forms";
import { useQuery } from "@tanstack/react-query";

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
  number: number;
  surname: string;
};
const BrowseTab = () => {
  useEffect(() => {
    const modal = document.querySelector(".react-responsive-modal-modal");
    const listenScroll = () => {
      console.log("SCROLLING");
    };

    modal?.addEventListener("scroll", listenScroll);

    return () => {
      modal?.removeEventListener("scroll", listenScroll);
    };
  }, []);
  const fetchCuttersTable = async () => {
    try {
      const { data: response } = await axiosClient.get(
        "/author-numbers/?format=array"
      );
      return response.data.table ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: authorNumbers } = useQuery<AuthorNumber[]>({
    queryFn: fetchCuttersTable,
    queryKey: ["cuttersTable"],
  });

  return (
    <div>
      <Input type="text" placeholder="Search..."></Input>
      <Table>
        <Thead>
          <HeadingRow>
            <Th>Surname</Th>
            <Th>Number</Th>
          </HeadingRow>
        </Thead>

        <Tbody>
          {authorNumbers?.map((authorNumber) => {
            return (
              <BodyRow key={authorNumber.surname}>
                <Td>{authorNumber.surname}</Td>
                <Td>{authorNumber.number}</Td>
              </BodyRow>
            );
          })}
        </Tbody>
      </Table>
    </div>
  );
};
export default CutterSelectionModal;
