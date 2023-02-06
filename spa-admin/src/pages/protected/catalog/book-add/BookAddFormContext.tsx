import { BaseProps } from "@definitions/props.definition";
import { Book, Author, AuthorNumber } from "@definitions/types";
import { useForm, UseFormType } from "@hooks/useForm";
import React, { createContext, useContext, useState } from "react";
import { NewBookSchemaValidation } from "../schema";
import { SingleValue } from "react-select";

export interface NewBookForm
  extends Omit<
    Book,
    | "id"
    | "section"
    | "fundSource"
    | "publisher"
    | "publisherId"
    | "sectionId"
    | "fundSourceId"
  > {
  section: SingleValue<{ label: string; value: number }>;
  fundSource: SingleValue<{ label: string; value: number }>;
  publisher: SingleValue<{ label: string; value: number }>;
}
export const BookAddFormContext = createContext({} as BookAddContextType);
interface BookAddContextType extends UseFormType<NewBookForm> {
  removeAuthorAsBasisForAuthorNumber: () => void;
  selectAuthorForAuthorNumberGeneration: (author: Author) => void;
  authorFromGeneratedAuthorNumber: Author | null;
  selectedAuthorNumberFromSelection: AuthorNumber;
  setAuthorNumberFromSelection: (authorNumber: AuthorNumber) => void;
  unSelectAuthorNumberSelection: () => void;
  unSelectAuthorFromGeneratedAuthorNumber: () => void;
}
export const useBookAddFormContext = () => {
  return useContext(BookAddFormContext);
};
export const BookAddFormProvider: React.FC<BaseProps> = ({ children }) => {
  const [authorFromGeneratedAuthorNumber, setAuthorFromGeneratedAuthorNumber] =
    useState<Author | null>(null);
  const DEFAULT_AUTHOR_NUMBER = {
    id: 0,
    number: 0,
    surname: "",
  };
  const [selectedAuthorNumberFromSelection, setAuthorNumberFromSelection] =
    useState<AuthorNumber>(DEFAULT_AUTHOR_NUMBER);

  const unSelectAuthorNumberSelection = () => {
    setAuthorNumberFromSelection({ ...DEFAULT_AUTHOR_NUMBER });
  };
  const unSelectAuthorFromGeneratedAuthorNumber = () => {
    setAuthorFromGeneratedAuthorNumber(null);
  };
  const formClient = useForm<NewBookForm>({
    initialFormData: {
      title: "",
      isbn: "",
      authors: [],
      section: {
        label: "Select section.",
        value: 0,
      },
      publisher: {
        label: "Select publisher.",
        value: 0,
      },
      fundSource: {
        label: "Select source of fund.",
        value: 0,
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
    },
    schema: NewBookSchemaValidation,
    scrollToError: true,
  });

  const removeAuthorAsBasisForAuthorNumber = () => {
    setAuthorFromGeneratedAuthorNumber(() => null);
  };
  const selectAuthorForAuthorNumberGeneration = (author: Author) => {
    setAuthorFromGeneratedAuthorNumber(author);
  };
  const setAuthorNumber = (authorNumber: AuthorNumber) => {
    setAuthorNumberFromSelection({ ...authorNumber });
  };
  return (
    <BookAddFormContext.Provider
      value={{
        ...formClient,
        removeAuthorAsBasisForAuthorNumber,
        selectAuthorForAuthorNumberGeneration,
        authorFromGeneratedAuthorNumber,
        selectedAuthorNumberFromSelection,
        setAuthorNumberFromSelection: setAuthorNumber,
        unSelectAuthorFromGeneratedAuthorNumber,
        unSelectAuthorNumberSelection,
      }}
    >
      {children}
    </BookAddFormContext.Provider>
  );
};
