import { BaseProps } from "@definitions/props.definition";
import { Book, Author } from "@definitions/types";
import { useForm, UseFormType } from "@hooks/useForm";
import React, { createContext, useContext, useState } from "react";
import { BookSchema } from "../schema";

export const BookAddFormContext = createContext({} as BookAddContextType);
interface BookAddContextType extends UseFormType<Omit<Book, "id">> {
  removeAuthorAsBasisForAuthorNumber: () => void;
  selectAuthorForAuthorNumberGeneration: (author: Author) => void;
  authorFromGeneratedAuthorNumber: Author | null;
}
export const useBookAddFormContext = () => {
  return useContext(BookAddFormContext);
};
export const BookAddFormProvider: React.FC<BaseProps> = ({ children }) => {
  const [authorFromGeneratedAuthorNumber, setAuthorFromGeneratedAuthorNumber] =
    useState<Author | null>(null);
  const formClient = useForm<Omit<Book, "id">>({
    initialFormData: {
      title: "",
      isbn: "",
      authors: [],
      copies: 1,
      receivedAt: new Date().toISOString(),
      authorNumber: {
        number: 0,
        surname: "",
        value: "",
      },
      sectionId: 0,
      ddc: 0,
      costPrice: 0,
      description: "",
      fundSourceId: 0,
      edition: 0,
      pages: 1,
      publisherId: 0,
      yearPublished: new Date().getFullYear(),
    },
    schema: BookSchema,
  });

  const removeAuthorAsBasisForAuthorNumber = () => {
    setAuthorFromGeneratedAuthorNumber(() => null);
  };
  const selectAuthorForAuthorNumberGeneration = (author: Author) => {
    setAuthorFromGeneratedAuthorNumber(author);
  };

  return (
    <BookAddFormContext.Provider
      value={{
        ...formClient,
        removeAuthorAsBasisForAuthorNumber,
        selectAuthorForAuthorNumberGeneration,
        authorFromGeneratedAuthorNumber,
      }}
    >
      {children}
    </BookAddFormContext.Provider>
  );
};
