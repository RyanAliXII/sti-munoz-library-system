import "react-datepicker/dist/react-datepicker.css";
import { BookEditFormProvider } from "./BookEditFormContext";
import BookEditForm from "./BookEditForm";
import { useState } from "react";
import EditAccessionPanel from "./EditAccessionPanel";
import { useSearchParams } from "react-router-dom";
import EbookPanel from "./ebook-panel/EbookPanel";
import { Tabs } from "flowbite-react";
import Container from "@components/ui/container/Container";

enum BookEditTab {
  BookInfo = 1,
  Accessions = 2,
  Ebook = 3,
}
const isActive = (activeTab: BookEditTab, tab: BookEditTab) => {
  if (activeTab === tab) {
    return true;
  }
  return false;
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
      if (parsedTabId == BookEditTab.Ebook) {
        return BookEditTab.Ebook;
      }
    }
    return BookEditTab.BookInfo;
  });

  return (
    <BookEditFormProvider>
      <Container>
        <Tabs.Group style="underline">
          <Tabs.Item
            title="Information"
            color="primary"
            className=""
            onClick={() => {
              setActiveTab(BookEditTab.BookInfo);
              setSearchParams({ tab: BookEditTab.BookInfo.toString() });
            }}
            active={isActive(activeTab, BookEditTab.BookInfo)}
          >
            <BookEditForm />
          </Tabs.Item>
          <Tabs.Item
            onClick={() => {
              setActiveTab(BookEditTab.Accessions);
              setSearchParams({ tab: BookEditTab.Accessions.toString() });
            }}
            title="Accessions"
            active={isActive(activeTab, BookEditTab.Accessions)}
            color="primary"
          >
            <EditAccessionPanel />
          </Tabs.Item>
          <Tabs.Item
            onClick={() => {
              setActiveTab(BookEditTab.Ebook);
              setSearchParams({ tab: BookEditTab.Ebook.toString() });
            }}
            title="eBook"
            active={isActive(activeTab, BookEditTab.Ebook)}
            color="primary"
          >
            <EbookPanel />
          </Tabs.Item>
        </Tabs.Group>
      </Container>
      <div className={isPanelActive(activeTab, BookEditTab.BookInfo)}></div>
      <div className={isPanelActive(activeTab, BookEditTab.Accessions)}></div>
      <div className={isPanelActive(activeTab, BookEditTab.Ebook)}></div>
    </BookEditFormProvider>
  );
};

export default BookEditPage;
