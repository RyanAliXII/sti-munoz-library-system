
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
  export interface EditModalProps <T> extends ModalProps  {
    formData: T
  }
  export type Author = {
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
    id?: number
    name: string;
    hasOwnAccession: boolean
  };

  export interface Book {
      id?: string;
      title: string;
      isbn: string
      copies: number;
      edition: number;
      costPrice: number;
      sectionId:number,
      section: string
      fundSourceId: number;
      fundSource: string
      publisherId: number;
      publisher:string
      pages: number;
      yearPublished: number;
      receivedAt: string //iso-string  date
      ddc: number;
      description: string;
      authors: Author[];
      authorNumber: string
      accessions: Accession[]
      createdAt: string //iso-string date
  }

  export type AuthorNumber = {
    id?: number;
    number: number;
    surname: string;
  };
  export type Accession = {
    number: number,
    copyNumber:number
  }

  export interface DetailedAccession extends Accession{

    bookId: string
    title: string
    ddc: number;
    authorNumber: string
    yearPublished: number;
    section:string
    isCheckedOut: boolean,
  }

  export type Audit = {
    id?:string
    name: string
  }

  export type Account = {
    id?: string
    displayName: string
    surname: string
    givenName:string
    email:string
  }


  export interface BorrowedAccession extends Omit<DetailedAccession, 'ddc | authorNumber | yearPublished | section'>{}

  export type BorrowingTransaction = {
    id?:string,
    accountDisplayName :string,
    accountId : string,
    accountEmail: string,
    borrowedAccessions: BorrowedAccession[]
    dueDate: string //iso-time-string
    createdAt: string //iso-time-string
    returnedAt: string//iso-time-string

  }
 
  export type BorrowStatus = "Returned" | "Overdue" | "Checked Out";

  export enum BorrowStatuses {
    Returned = "Returned",
    Overdue = "Overdue",
    CheckedOut = "Checked Out",
    Available = "Available",
  }