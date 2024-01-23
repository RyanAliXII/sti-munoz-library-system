import { Book, BorrowedCopy, BorrowingTransaction } from "./types";

export const BookInitialValue: Book = {
  subject: "",
  title: "",
  ebook: "",
  isbn: "",
  authors: [],
  section: {
    name: "",
    id: 0,
    accessionTable: "",
    isNonCirculating: false,
    isDeleteable: false,
    isSubCollection: false,
  },
  publisher: {
    name: "",
    id: 0,
  },

  covers: [],
  copies: 1,
  receivedAt: new Date().toISOString(),
  authorNumber: "",
  ddc: "",

  description: "",

  edition: 0,
  pages: 1,

  yearPublished: new Date().getFullYear(),
  accessions: [],
};

export const BorrowedCopyInitialValue: BorrowedCopy = {
  book: BookInitialValue,
  isReturned: false,
  bookId: "",
  copyNumber: 0,
  number: 0,
  returnedAt: "",
  isAvailable: false,
};

export const BorrowingTransactionInitialValue: BorrowingTransaction = {
  client: {
    profilePicture: "",
    metadata: {
      approvedBooks: 0,
      cancelledBooks: 0,
      checkedOutBooks: 0,
      pendingBooks: 0,
      returnedBooks: 0,
      totalPenalty: 0,
    },
    displayName: "",
    email: "",
    givenName: "",
    surname: "",
    id: "",
  },
  borrowedCopies: [],
  createdAt: "",
  dueDate: "",
  returnedAt: "",
  remarks: "",
  isReturned: false,
};
