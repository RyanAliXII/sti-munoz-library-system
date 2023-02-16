import { Book, BorrowedCopy, BorrowingTransaction } from "./types";


export const BookInitialValue: Book =  {
    title: "",
    isbn: "",
    authors: [],
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
  }

  export const BorrowedCopyInitialValue:BorrowedCopy = {
    book: BookInitialValue,
    bookId: "",
    copyNumber: 0,
    number: 0,
    returnedAt:""
  }

  export const BorrowingTransactionInitialValue: BorrowingTransaction = {
    client: {
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
}