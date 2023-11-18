import { OnlineBorrowStatus } from "@internal/borrow_status";

export type User = {
  firstname?: string;
  lastname?: string;
  email?: string;
  id: string;
  image?: Blob;
};

export interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
}
export interface EditModalProps<T> extends ModalProps {
  formData: T;
}
export type Author = {
  id?: string;
  name: string;
};

export type Publisher = {
  id?: number;
  name: string;
};

export type Section = {
  id?: number;
  name: string;
  hasOwnAccession: boolean;
};

export interface Book {
  id?: string;
  title: string;
  isbn: string;
  copies: number;
  edition: number;
  section: Section;
  publisher: Publisher;
  pages: number;
  yearPublished: number;
  receivedAt: string; //iso-string  date
  ddc: string;
  description: string;
  authors: Author[];
  covers: string[];
  authorNumber: string;
  accessions: Accession[];
  ebook: string;
}

export type AuthorNumber = {
  id?: number;
  number: number;
  surname: string;
};
export type Accession = {
  id?: string;
  number: number;
  copyNumber: number;
  isAvailable: boolean;
};

export interface DetailedAccession extends Accession {
  bookId: string;
  isCheckedOut: boolean;
  book: Book;
}
export type BookStatus = {
  isAvailable: boolean;
  isAlreadyBorrowed: boolean;
  isAlreadyInBag: boolean;
};
export type Audit = {
  id?: string;
  name: string;
};
export type Account = {
  id?: string;
  displayName: string;
  surname: string;
  givenName: string;
  email: string;
  profilePicture: string;
  metadata: {
    totalPenalty: number;
    checkedOutBooks: number;
    returnedBooks: number;
    pendingBooks: number;
    approvedBooks: number;
    cancelledBooks: number;
  };
};

export type BorrowingQueue = {
  accountId: string;
  id?: string;
  bookId: string;
  book: Book;
  account: Account;
};

export interface BorrowedCopy extends Omit<DetailedAccession, "isCheckedOut"> {
  returnedAt: string; //iso-time-string
  isReturned: boolean;
}

export type BorrowingTransaction = {
  id?: string;
  client: Account;
  borrowedCopies: BorrowedCopy[];
  remarks: string;
  isReturned: boolean;
  dueDate: string; //iso-time-string
  createdAt: string; //iso-time-string
  returnedAt: string; //iso-time-string
};

export type Organization = {
  id?: number;
  name: string;
};
export type Permission = {
  name: string;
  description: string;
};
export type Module = {
  name: string;
  displayText: string;
  permissions: Permission[];
};

export type Role = {
  id?: number;
  name: string;
  permissions: Record<string, string[]>;
};

export type BagItem = {
  id?: string;
  accessionId: string;
  accountId: string;
  accessionNumber: number;
  copyNumber: number;
  book: Book;
  isChecked: boolean;
  isEbook: boolean;
  isAvailable: boolean;
};

export type BorrowedBook = {
  id?: string;
  accessionId: string;
  accountId: string;
  accessionNumber: number;
  copyNumber: number;
  book: Book;
  statusId: number;
  isEbook: boolean;
  penalty: number;
  status: string;
  dueDate: string | null; //timestamp
};
