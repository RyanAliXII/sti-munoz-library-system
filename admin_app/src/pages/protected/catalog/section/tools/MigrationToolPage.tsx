import BookSearchBox from "@components/BookSearchBox";
import { Book } from "@definitions/types";
import React from "react";

const MigrationToolPage = () => {
  const onSelectBook = (book: Book) => {
    console.log(book);
  };
  return (
    <div>
      <BookSearchBox selectBook={onSelectBook} />
    </div>
  );
};

export default MigrationToolPage;
