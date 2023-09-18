import { OnlineBorrowStatus } from "@internal/borrow-status";

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

export type PersonAuthor = {
  id?: number;
  givenName: string;
  middleName?: string;
  surname: string;
};

export type Publisher = {
  id?: number;
  name: string;
};
export type Source = {
  id?: number;
  name: string;
};
export type Section = {
  id?: number;
  name: string;
  prefix: string;
  hasOwnAccession: boolean;
};

export interface Book {
  id?: string;
  title: string;
  isbn: string;
  copies: number;
  edition: number;
  costPrice: number;
  section: Section;
  fundSource: Source;
  publisher: Publisher;
  pages: number;
  yearPublished: number;
  receivedAt: string; //iso-string  date
  ddc: string;
  description: string;
  authors: {
    people: PersonAuthor[];
    organizations: Organization[];
    publishers: Publisher[];
  };
  covers: string[];
  authorNumber: string;
  accessions: Accession[];
  createdAt: string; //iso-string date
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

export type Audit = {
  id?: string;
  name: string;
};
export type DDC = {
  id: number;
  name: string;
  number: string;
};
export type Account = {
  id?: string;
  displayName: string;
  surname: string;
  givenName: string;
  email: string;
  metaData: {
    totalPenalty: number;
    walkInCheckedOutBooks: number;
    walkInReturnedBooks: number;
    onlinePendingBooks: number;
    onlineApprovedBooks: number;
    onlineCheckedOutBooks: number;
    onlineReturnedBooks: number;
    onlineCancelledBooks: number;
  };
};

export interface BorrowedCopy extends Omit<DetailedAccession, "isCheckedOut"> {
  returnedAt: string; //iso-time-string
  isReturned: boolean;
  isCancelled: boolean;
  isUnreturned: boolean;
  client: Account;
  dueDate: string;
  remarks: string;
  penalty: number;
}

export type BorrowedBook = {
  id: string;
  status: string;
  statusId: number;
  client: Account;
  book: Book;
  accessionId: string;
  accessionNumber: number;
  copyNumber: number;
  dueDate: string;
  penalty: number;
  createdAt: string;
};
export type BorrowingTransaction = {
  id?: string;
  client: Account;
  borrowedCopies: BorrowedCopy[];
  remarks: string;
  isReturned: boolean;
  isDue: boolean;
  createdAt: string; //iso-time-string
  returnedAt: string; //iso-time-string
};
export type BorrowRequest = {
  id: string;
  client: Account;
  accountId: string;
  createdAt: string;
};

export type Organization = {
  id?: number;
  name: string;
};

export type Permission = {
  id: number;
  name: string;
  value: string;
  description: string;
};

export type Role = {
  id?: number;
  name: string;
  permissions: Permission[];
};
export type AccountRole = {
  account: Account;
  role: Role;
};
export type OnlineBorrowedBook = {
  id?: string;
  accessionId: string;
  accountId: string;
  accessionNumber: number;
  copyNumber: number;
  book: Book;
  penalty: number;
  remarks: string;
  status: OnlineBorrowStatus;
  dueDate: string | null; //timestamp
  client: Account;
};

export interface SettingsField<T> {
  id: string;
  label: string;
  description: string;
  value: T;
}
export type Settings = {
  "app.due-penalty": SettingsField<number>;
};

export type Penalty = {
  id?: string;
  description: string;
  amount: number;
  accountId: string;
  account: Account;
  isSettled: boolean;
  settledAt: string | null; //iso-time-string
  createdAt: string; //iso-time-string
};

export type LibraryStats = {
  accounts: number;
  books: number;
  penalties: number;
  settledPenalties: number;
  unsettledPenalties: number;
  pendingBooks: number;
  approvedBooks: number;
  checkedOutBooks: number;
  returnedBooks: number;
  unreturnedBooks: number;
  cancelledBooks: number;
};
