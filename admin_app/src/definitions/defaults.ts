import { Account, Book, BorrowedCopy, BorrowingTransaction } from "./types";

export const BookInitialValue: Book = {
  title: "",
  isbn: "",
  authors: [],
  ebook: "",
  section: {
    name: "",
    id: 0,
    prefix: "",
    hasOwnAccession: false,
  },
  publisher: {
    name: "",
    id: "",
  },
  searchTags: [],
  subject: "",
  sourceOfFund: "",
  covers: [],
  copies: 1,
  receivedAt: new Date().toISOString(),
  authorNumber: "",
  ddc: "",
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
  isActive: false,
  isDeleted: false,
  metadata: {
    approvedBooks: 0,
    cancelledBooks: 0,
    checkedOutBooks: 0,
    pendingBooks: 0,
    returnedBooks: 0,
    totalPenalty: 0,
  },
};
export const BorrowedCopyInitialValue: BorrowedCopy = {
  book: BookInitialValue,
  isWeeded: false,
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
    isActive: false,
    isDeleted: false,
    metadata: {
      approvedBooks: 0,
      cancelledBooks: 0,
      checkedOutBooks: 0,
      pendingBooks: 0,
      returnedBooks: 0,
      totalPenalty: 0,
    },
  },
  isDue: false,
  borrowedCopies: [],
  createdAt: "",
  returnedAt: "",
  remarks: "",
  isReturned: false,
};

export const GameLogInitialValue = {
  accountId: "",
  createdAt: "",
  client: AccountInitialValue,
  game: {
    description: "",
    id: "",
    name: "",
  },
  gameId: "",
  id: "",
};
