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
      receivedAt: string;
      ddc: number;
      description: string;
      authors: Author[];
      authorNumber: string
  }
  export type AuthorNumber = {
    id?: number;
    number: number;
    surname: string;
  };
  export type Accession = {
    number: number,
    copyNumber:number
    bookId: string
    title: string
    ddc: number;
    authorNumber: string
    yearPublished: number;
    section:string
  }