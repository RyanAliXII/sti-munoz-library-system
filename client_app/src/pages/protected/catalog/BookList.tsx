import { Book } from "@definitions/types";
import BookCard from "./BookCard";

const BookList = ({ books }:{
  books: Book[]
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 lg:p-10">
    {books?.map((book) => (
      <BookCard key={book.id} book={book} />
    ))}
  </div>
);

export default BookList;
