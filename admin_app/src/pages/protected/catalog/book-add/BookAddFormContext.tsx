import { BaseProps } from "@definitions/props.definition";
import { Book } from "@definitions/types";
import { useForm, UseFormType } from "@hooks/useForm";
import React, { createContext, useContext } from "react";
import { NewBookSchemaValidation } from "../schema";
import { format } from "date-fns";
export const BookAddFormContext = createContext({} as BookAddContextType);
interface BookAddContextType extends UseFormType<Book> {}
export const useBookAddFormContext = () => {
  return useContext(BookAddFormContext);
};
export const BookAddFormProvider: React.FC<BaseProps> = ({ children }) => {
  const formClient = useForm<Book>({
    initialFormData: {
      title: "",
      isbn: "",
      subject: "",
      sourceOfFund: "",
      section: {
        hasOwnAccession: false,
        name: "",
        prefix: "",
        id: 0,
      },
      publisher: {
        name: "",
        id: "",
      },
      authors: [],
      copies: 1,
      receivedAt: format(new Date(), "yyyy-MM-dd"),
      authorNumber: "",
      ddc: "",
      costPrice: 0,
      description: "",

      edition: 0,
      pages: 1,
      searchTags: [],
      yearPublished: new Date().getFullYear(),
      accessions: [],
      covers: [],
    },
    schema: NewBookSchemaValidation,
    scrollToError: true,
  });

  return (
    <BookAddFormContext.Provider
      value={{
        ...formClient,
      }}
    >
      {children}
    </BookAddFormContext.Provider>
  );
};
