import "react-responsive-modal/styles.css";

import { Author, PersonAuthor } from "@definitions/types";

import { ContainerNoBackground } from "@components/ui/container/Container";

import PersonAsAuthor from "./person/PersonAsAuthor";
import { useState } from "react";

import OrganizationAsAuthor from "./organization/OrganizationAsAuthor";
import PublisherAsAuthor from "./publisher/PublisherAsAuthor";

export const ADD_AUTHOR_INITIAL_FORM: Omit<Author, "id"> = {
  name: "",
};
export const EDIT_AUTHOR_INITIAL_FORM: Author = {
  id: 0,
  name: "",
};
enum Tab {
  Person = "Person",
  Organization = "Organization",
  Publisher = "Publisher",
}
enum Classes {
  Active = "inline-block py-2 px-2 text-blue-400 border border-blue-400  rounded-lg active cursor-pointer",
  Default = "inline-block py-2 px-2 text-gray-400 border  rounded-lg cursor-pointer",
}
type ActiveTab = "Person" | "Organization" | "Publisher";
const checkActive = (key: string, state: string) => {
  if (key === state) {
    return Classes.Active;
  }
  return Classes.Default;
};
const AuthorPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(Tab.Person);
  return (
    <>
      <ContainerNoBackground>
        <div className="w-full flex gap-10">
          <h1 className="text-3xl font-bold text-gray-700">Authors</h1>
          <div>
            <nav className="mb-6">
              <ul className="flex flex-wrap text-sm font-medium text-center gap-2 text-gray-500  border-gray-200 ">
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
        </div>
      </ContainerNoBackground>
      <TabContent activeTab={activeTab} />
    </>
  );
};
type TabContentProps = {
  activeTab: ActiveTab;
};
const TabContent = ({ activeTab }: TabContentProps) => {
  switch (activeTab) {
    case Tab.Person:
      return <PersonAsAuthor key="PersonAsAuthor" />;
    case Tab.Organization:
      return <OrganizationAsAuthor key="OrgAsAuthor" />;
    case Tab.Publisher:
      return <PublisherAsAuthor key="PublisherAsAuthor" />;
    default:
      return null;
  }
};
export default AuthorPage;
