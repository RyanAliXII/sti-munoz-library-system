import { ModalProps } from "@definitions/types";
import React, { useState } from "react";

import { useRef } from "react";

import { Modal } from "flowbite-react";
import BrowseTab from "./BrowseTab";
import GenerateTab from "./GenerateTab";

enum Classes {
  Active = "inline-block p-4 text-blue-400 bg-gray-100 rounded-t-lg active cursor-pointer dark:bg-gray-900",
  Default = "inline-block p-4 text-gray-400  rounded-t-lg cursor-pointer",
}

enum Tab {
  Generate = "GENERATE",
  Browse = "BROWSE",
}

type ActiveTab = "GENERATE" | "BROWSE";

interface TabContentProps {
  activeTab: ActiveTab;
  modalRef: React.RefObject<HTMLDivElement>;
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

  return (
    <Modal
      ref={modalRef}
      onClose={closeModal}
      show={isOpen}
      size={"5xl"}
      dismissible
    >
      <Modal.Body style={{ maxHeight: "800px" }} className="small-scroll">
        <div>
          <nav className="mb-6">
            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b dark:border-b-gray-600 border-gray-200">
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
        <TabContent modalRef={modalRef} activeTab={activeTab}></TabContent>
      </Modal.Body>
    </Modal>
  );
};

const TabContent = ({ activeTab, modalRef }: TabContentProps) => {
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
