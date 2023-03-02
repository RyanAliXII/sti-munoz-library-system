import { BaseProps } from "@definitions/props.definition";
import { Book, PersonAuthor, AuthorNumber } from "@definitions/types";
import { useForm, UseFormType } from "@hooks/useForm";
import React, { createContext, useContext, useState } from "react";
import { NewBookSchemaValidation } from "../schema";

export const BookAddFormContext = createContext({} as BookAddContextType);
interface BookAddContextType extends UseFormType<Book> {
  // removeAuthorAsBasisForAuthorNumber: () => void;
  // selectAuthorForAuthorNumberGeneration: (author: PersonAuthor) => void;
  // authorKeyFromGeneratedAuthorNumber: PersonAuthor | null;
  // selectedAuthorNumberFromSelection: AuthorNumber;
  // setAuthorKeyNumberFromSelection: (authorNumber: AuthorNumber) => void;
  // unSelectAuthorNumberSelection: () => void;
  // unSelectAuthorFromGeneratedAuthorNumber: () => void;
}
export const useBookAddFormContext = () => {
  return useContext(BookAddFormContext);
};
export const BookAddFormProvider: React.FC<BaseProps> = ({ children }) => {
  const formClient = useForm<Book>({
    initialFormData: {
      title: "",
      isbn: "",
      authors: {
        organizations: [],
        people: [],
        publishers: [],
      },
      section: {
        name: "",
        id: 0,
        hasOwnAccession: false,
      },
      publisher: {
        name: "",
        id: 0,
      },
      fundSource: {
        name: "",
        id: 0,
      },
      copies: 1,
      receivedAt: new Date().toISOString(),
      authorNumber: "",
      ddc: 0,
      costPrice: 0,
      description: "",

      edition: 0,
      pages: 1,

      yearPublished: new Date().getFullYear(),
      accessions: [],
      createdAt: "",
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
