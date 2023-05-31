import { Account, Book, BorrowedCopy, BorrowingTransaction } from "./types";

export const BookInitialValue: Book = {
  title: "",
  isbn: "",
  authors: {
    organizations: [],
    people: [],
    publishers: [],
  },
  section: {
    name: "",
    id: 0,
    hasOwnAccession: false,
  },
  publisher: {
    name: "",
    id: 0,
  },
  fundSource: {
    name: "",
    id: 0,
  },
  covers: [],
  copies: 1,
  receivedAt: new Date().toISOString(),
  authorNumber: "",
  ddc: 0,
  costPrice: 0,
  description: "",

  edition: 0,
  pages: 1,

  yearPublished: new Date().getFullYear(),
  accessions: [],
  createdAt: "",
};
export const AccountInitialValue: Account = {
  displayName: "",
  email: "",
  givenName: "",
  surname: "",
  id: "",
  metaData: {
    onlineApprovedBooks: 0,
    onlineCancelledBooks: 0,
    onlineCheckedOutBooks: 0,
    onlinePendingBooks: 0,
    onlineReturnedBooks: 0,
    totalPenalty: 0,
    walkInCheckedOutBooks: 0,
    walkInReturnedBooks: 0,
  },
};
export const BorrowedCopyInitialValue: BorrowedCopy = {
  book: BookInitialValue,
  isReturned: false,
  bookId: "",
  copyNumber: 0,
  number: 0,
  dueDate: "",
  isCancelled: false,
  isUnreturned: false,
  returnedAt: "",
  remarks: "",
  penalty: 0,
  client: AccountInitialValue,

  isAvailable: false,
};

export const BorrowingTransactionInitialValue: BorrowingTransaction = {
  client: {
    displayName: "",
    email: "",
    givenName: "",
    surname: "",
    id: "",
    metaData: {
      onlineApprovedBooks: 0,
      onlineCancelledBooks: 0,
      onlineCheckedOutBooks: 0,
      onlinePendingBooks: 0,
      onlineReturnedBooks: 0,
      totalPenalty: 0,
      walkInCheckedOutBooks: 0,
      walkInReturnedBooks: 0,
    },
  },
  isDue: false,
  borrowedCopies: [],
  createdAt: "",
  returnedAt: "",
  remarks: "",
  isReturned: false,
};
