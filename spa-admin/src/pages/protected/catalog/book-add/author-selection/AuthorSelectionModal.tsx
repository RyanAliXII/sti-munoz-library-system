import { ModalProps } from "@definitions/types";

import Modal from "react-responsive-modal";

import PersonAsAuthorSelection from "./PersonAsAuthorSelection";
import OrganizationSelection from "./OrganizationSelection";
import PublisherSelection from "./PublisherSelection";

import { useState } from "react";
import { useBookAddFormContext } from "../BookAddFormContext";

type ActiveTab = "PERSON" | "ORG" | "PUBLISHER";
enum Tab {
  Person = "PERSON",
  Organization = "ORG",
  Publisher = "PUBLISHER",
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
const AuthorSelectionModal = ({ closeModal, isOpen }: ModalProps) => {
  const { form } = useBookAddFormContext();
  const [activeTab, setActiveTab] = useState<ActiveTab>(Tab.Person);
  const numberOfAuthorSelected =
    form.authors.organizations.length +
    form.authors.people.length +
    form.authors.publishers.length;
  if (!isOpen) return null;
  return (
    <>
      <Modal
        open={isOpen}
        onClose={closeModal}
        center
        showCloseIcon={false}
        styles={{
          modal: {
            maxWidth: "none",
          },
        }}
        classNames={{
          modal: "lg:w-8/12 rounded  ",
        }}
      >
        <div>
          <div className="mb-3">
            <h3 className="text-2xl"> Authors</h3>
            <small>
              You have selected:
              <span className="font-semibold">
                {" "}
                {numberOfAuthorSelected}{" "}
                {numberOfAuthorSelected > 1 ? "Authors" : "Author"}
              </span>
            </small>

            <div>
              <nav className="mb-6 mt-5">
                <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 ">
                  <li className="mr-2">
                    <a
                      aria-current="page"
                      className={checkActive(Tab.Person, activeTab)}
                      onClick={() => {
                        setActiveTab(Tab.Person);
                      }}
                    >
                      Person as Author
                    </a>
                  </li>
                  <li className="mr-2">
                    <a
                      aria-current="page"
                      className={checkActive(Tab.Organization, activeTab)}
                      onClick={() => {
                        setActiveTab(Tab.Organization);
                      }}
                    >
                      Organization as Author
                    </a>
                  </li>
                  <li className="mr-2">
                    <a
                      aria-current="page"
                      className={checkActive(Tab.Publisher, activeTab)}
                      onClick={() => {
                        setActiveTab(Tab.Publisher);
                      }}
                    >
                      Publisher as Author
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            <TabContent activeTab={activeTab} />
          </div>
        </div>
      </Modal>
    </>
  );
};

type TabContentProps = {
  activeTab: ActiveTab;
};
const TabContent = ({ activeTab }: TabContentProps) => {
  switch (activeTab) {
    case Tab.Person:
      return <PersonAsAuthorSelection />;
    case Tab.Organization:
      return <OrganizationSelection />;
    case Tab.Publisher:
      return <PublisherSelection />;
    default:
      return <></>;
  }
};
export default AuthorSelectionModal;
