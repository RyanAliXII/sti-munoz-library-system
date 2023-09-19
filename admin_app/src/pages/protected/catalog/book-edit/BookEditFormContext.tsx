import { BaseProps } from "@definitions/props.definition";
import { Book } from "@definitions/types";
import { useForm, UseFormType } from "@hooks/useForm";
import React, { createContext, useContext } from "react";
import { UpdateBookSchemaValidation } from "../schema";

export const BookEditFormContext = createContext({} as BookAddContextType);
interface BookAddContextType extends UseFormType<Book> {}
export const useBookEditFormContext = () => {
  return useContext(BookEditFormContext);
};

const INITIAL_FORM_DATA: Book = {
  title: "",
  isbn: "",
  authors: {
    organizations: [],
    people: [],
    publishers: [],
  },
  copies: 1,
  section: {
    name: "Select section.",
    id: 0,
    prefix: "",
    hasOwnAccession: false,
  },
  publisher: {
    name: "Select publisher.",
    id: 0,
  },
  fundSource: {
    name: "Select source of fund.",
    id: 0,
  },
  receivedAt: new Date().toISOString(),
  authorNumber: "",
  ddc: "",
  costPrice: 0,
  description: "",

  edition: 0,
  pages: 1,

  yearPublished: new Date().getFullYear(),
  createdAt: "",
  accessions: [],
  covers: [],
};

export const BookEditFormProvider: React.FC<BaseProps> = ({ children }) => {
  const formClient = useForm<Book>({
    initialFormData: INITIAL_FORM_DATA,
    schema: UpdateBookSchemaValidation,
    scrollToError: true,
  });

  return (
    <BookEditFormContext.Provider
      value={{
        ...formClient,
      }}
    >
      {children}
    </BookEditFormContext.Provider>
  );
};
