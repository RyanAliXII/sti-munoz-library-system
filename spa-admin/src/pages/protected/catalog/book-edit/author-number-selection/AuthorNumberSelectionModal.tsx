import { ModalProps } from "@definitions/types";
import React, { useEffect, useState } from "react";
import Modal from "react-responsive-modal";

import { useRef } from "react";

import GenerateTab from "./GenerateTab";
import BrowseTab from "./BrowseTab";
import { useBookEditFormContext } from "../BookEditFormContext";

enum Classes {
  Active = "inline-block p-4 text-blue-400 bg-gray-100 rounded-t-lg active cursor-pointer",
  Default = "inline-block p-4 text-gray-400  rounded-t-lg cursor-pointer",
}

enum Tab {
  Generate = "GENERATE",
  Browse = "BROWSE",
}

type ActiveTab = "GENERATE" | "BROWSE";

interface TabContentProps {
  activeTab: ActiveTab;
}

const checkActive = (key: string, state: string) => {
  if (key === state) {
    return Classes.Active;
  }
  return Classes.Default;
};
const AuthorNumberSelectionModal: React.FC<ModalProps> = ({
  closeModal,
  isOpen,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(Tab.Generate);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    selectedAuthorNumberFromSelection,
    form,
    unSelectAuthorNumberSelection,
    unSelectAuthorFromGeneratedAuthorNumber,
  } = useBookEditFormContext();
  useEffect(() => {
    const currentSelectedAuthorNumber = `${selectedAuthorNumberFromSelection.surname.charAt(
      0
    )}${selectedAuthorNumberFromSelection.number}`;
    if (form.authorNumber != currentSelectedAuthorNumber) {
      unSelectAuthorNumberSelection();
      unSelectAuthorFromGeneratedAuthorNumber();
    }
  }, [isOpen]);
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
                className={checkActive(Tab.Generate, activeTab)}
                onClick={() => {
                  setActiveTab(Tab.Generate);
                }}
              >
                GENERATE
              </a>
            </li>
            <li className="mr-2">
              <a
                aria-current="page"
                className={checkActive(Tab.Browse, activeTab)}
                onClick={() => {
                  setActiveTab(Tab.Browse);
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

const TabContent = ({ activeTab }: TabContentProps) => {
  switch (activeTab) {
    case Tab.Generate:
      return <GenerateTab />;
    case Tab.Browse:
      return <BrowseTab />;
    default:
      return <></>;
  }
};

export default AuthorNumberSelectionModal;
