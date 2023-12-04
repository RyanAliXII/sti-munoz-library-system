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
export type Author = {
  id: string;
  name: string;
};
export type Publisher = {
  id?: string;
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
  lastValue?: number;
  hasOwnAccession: boolean;
};

export interface Book {
  id?: string;
  title: string;
  subject: string;
  isbn: string;
  copies: number;
  edition: number;
  costPrice: number;
  section: Section;
  sourceOfFund: string;
  publisher: Publisher;
  pages: number;
  yearPublished: number;
  receivedAt: string; //iso-string  date
  ddc: string;
  description: string;
  authors: Author[];
  covers: string[];
  ebook: string;
  authorNumber: string;
  accessions: Accession[];
  searchTags: string[];
  createdAt?: string; //iso-string date
}

export type AuthorNumber = {
  id?: number;
  number: string;
  surname: string;
};
export type Accession = {
  id?: string;
  number: number;
  copyNumber: number;
  isAvailable: boolean;
  isWeeded: false;
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
export type BorrowingQueue = {
  book: Book;
  items: number;
};

export type BorrowingQueueItem = {
  accountId: string;
  id?: string;
  bookId: string;
  book: Book;
  client: Account;
  createdAt?: string;
  dequeuedAt?: string;
};

export type Game = {
  id: string;
  name: string;
  description: string;
};
export type DateSlot = {
  id: string;
  date: string;
  profileId: string;
  timeSlotProfile: TimeSlotProfile;
};
export type GameLog = {
  id: string;
  gameId: string;
  accountId: string;
  client: Account;
  game: Game;
  createdAt: string;
};
export type Reservation = {
  id: string;
  deviceId: string;
  timeSlotId: string;
  dateSlotId: string;
  accountId: string;
  timeSlot: TimeSlot;
  dateSlot: DateSlot;
  client: Account;
  device: Device;
  status: string;
  remarks: string;
  statusId: number;
  createdAt: string;
};
export type Device = {
  id: string;
  name: string;
  description: string;
  available: number;
};
export type TimeSlotProfile = {
  id: string;
  name: string;
  timeSlots?: TimeSlot[];
};
export type Account = {
  id?: string;
  displayName: string;
  surname: string;
  givenName: string;
  email: string;
  isActive: boolean;
  isDeleted: boolean;
  metadata: {
    totalPenalty: number;
    checkedOutBooks: number;
    returnedBooks: number;
    pendingBooks: number;
    approvedBooks: number;
    cancelledBooks: number;
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
  isEbook: boolean;
  remarks: string;
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
  totalPenalty: number;
  totalPending: number;
  totalApproved: number;
  totalCheckedOut: number;
  totalReturned: number;
  totalCancelled: number;
  totalUnreturned: number;
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

export interface SettingsField {
  id: string;
  label: string;
  description: string;
  type: "int" | "date" | "string" | "boolean";
  value: any;
  defaultValue: any;
}
export type Settings = {
  [id: string]: SettingsField;
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
  monthlyWalkIns: WalkInLog[];
  weeklyWalkIns: WalkInLog[];
  monthlyBorrowedSections: BorrowedSection[];
  weeklyBorrowedSections: BorrowedSection[];
};
export type Metadata = {
  pages: number;
  records: number;
};
export type WalkInLog = {
  date: string;
  walkIns: number;
};
export type BorrowedSection = {
  total: number;
  name: string;
};
export type ScannerAccount = {
  id?: string;
  description: string;
  password?: string;
  username: string;
};
export type UserType = {
  id: number;
  name: string;
  hasProgram: boolean;
};
export type UserProgramOrStrand = {
  id: number;
  name: string;
  code: string;
  userTypeId: number;
};

export type ClientLog = {
  id: string;
  client: Account;
  scanner: ScannerAccount;
  createdAt: string;
};
export type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  profileId: string;
};
export interface EditModalProps<T> extends ModalProps {
  formData: T;
}
