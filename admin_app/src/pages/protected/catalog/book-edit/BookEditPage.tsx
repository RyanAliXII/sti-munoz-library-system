import {} from "@components/ui/form/Input";

import "react-datepicker/dist/react-datepicker.css";

import { BookEditFormProvider } from "./BookEditFormContext";
import BookEditForm from "./BookEditForm";
import { useState } from "react";
import EditAccessionPanel from "./EditAccessionPanel";
import { useSearchParams } from "react-router-dom";
import EbookPanel from "./EbookPanel";

enum BookEditTab {
  BookInfo = 1,
  Accessions = 2,
  Ebook = 3,
}
const isActive = (activeTab: BookEditTab, tab: BookEditTab) => {
  if (activeTab === tab) {
    return "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active  dark:text-blue-500";
  }
  return "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:text-gray-300";
};
const isPanelActive = (activeTab: BookEditTab, tab: BookEditTab) => {
  if (activeTab === tab) {
    return "";
  }
  return "hidden";
};
const BookEditPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<BookEditTab>(() => {
    const tabId = searchParams.get("tab");
    const parsedTabId = parseInt(tabId ?? "");
    if (!isNaN(parsedTabId)) {
      if (parsedTabId == BookEditTab.Accessions) {
        return BookEditTab.Accessions;
      }
    }
    return BookEditTab.BookInfo;
  });

  return (
    <BookEditFormProvider>
      <div className="w-11/12 mx-auto">
        <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200  dark:text-gray-400">
          <li className="mr-2">
            <a
              role="button"
              aria-current="page"
              className={isActive(activeTab, BookEditTab.BookInfo)}
              onClick={() => {
                setSearchParams({
                  tab: BookEditTab.BookInfo.toString(),
                });
                setActiveTab(BookEditTab.BookInfo);
              }}
            >
              Book Information
            </a>
          </li>
          <li className="mr-2">
            <a
              role="button"
              className={isActive(activeTab, BookEditTab.Accessions)}
              onClick={() => {
                setSearchParams({
                  tab: BookEditTab.Accessions.toString(),
                });
                setActiveTab(BookEditTab.Accessions);
              }}
            >
              Accessions
            </a>
          </li>
          <li className="mr-2">
            <a
              role="button"
              className={isActive(activeTab, BookEditTab.Ebook)}
              onClick={() => {
                setSearchParams({
                  tab: BookEditTab.Ebook.toString(),
                });
                setActiveTab(BookEditTab.Ebook);
              }}
            >
              eBook
            </a>
          </li>
        </ul>
      </div>
      <div className={isPanelActive(activeTab, BookEditTab.BookInfo)}>
        <BookEditForm />
      </div>
      <div className={isPanelActive(activeTab, BookEditTab.Accessions)}>
        <EditAccessionPanel />
      </div>
      <div className={isPanelActive(activeTab, BookEditTab.Ebook)}>
        <EbookPanel />
      </div>
    </BookEditFormProvider>
  );
};

export default BookEditPage;
