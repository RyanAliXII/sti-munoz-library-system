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
  export type Category = {
    name: string;
  };

  export type Book= {
    id?: string;
    title: string;
    copies: number;
    edition: number;
    costPrice: number;
    fundSource: number;
    publisher: number;
    pages: number;
    year: number;
    dateReceived: string;
    category: string;
    authorNumber: Omit<AuthorNumberForm, "id">;
    ddc: string;
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
  