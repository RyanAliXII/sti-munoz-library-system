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

  export type PublisherType = {
    id?: number;
    name: string;
  };
  export type SourceType = {
    id?: number;
    name: string;
  };
  export type CategoryType = {
    name: string;
  };

  export type BookType = {
    id: string;
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
    authorNumber: string;
    ddc: string;
    authors: Author[];
    description: string;
  };
  