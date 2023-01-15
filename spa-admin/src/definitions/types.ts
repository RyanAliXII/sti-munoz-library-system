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

  export type Book = {
    id?: string;
    title: string;
    isbn: string
    copies: number;
    edition: number;
    costPrice: number;
    sectionId:number,
    fundSourceId: number;
    publisherId: number;
    pages: number;
    yearPublished: number;
    receivedAt: string;
    authorNumber: Omit<AuthorNumberForm, "id">;
    ddc: number;
    authors: Author[];
    description: string;
  };

  export type AuthorNumber = {
    id?: number;
    number: number;
    surname: string;
  };
  export interface AuthorNumberForm extends AuthorNumber{
    value: string
  }
  
  