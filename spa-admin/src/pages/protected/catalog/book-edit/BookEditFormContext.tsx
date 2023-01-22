import { BaseProps } from "@definitions/props.definition";
import { Book, Author, AuthorNumber } from "@definitions/types";
import { useForm, UseFormType } from "@hooks/useForm";
import React, { createContext, useContext, useEffect, useState } from "react";
import { BookSchema, NewBookSchemaValidation } from "../schema";
import { SingleValue } from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@definitions/configs/axios";
import { sortedIndexOf } from "lodash";
import { AxiosError } from "axios";
import { STATUS_CODES } from "http";
import { StatusCodes } from "http-status-codes";

export interface EditBookForm
  extends Omit<
    Book,
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
export const BookEditFormContext = createContext({} as BookAddContextType);
interface BookAddContextType extends UseFormType<EditBookForm> {
  removeAuthorAsBasisForAuthorNumber: () => void;
  selectAuthorForAuthorNumberGeneration: (author: Author) => void;
  authorFromGeneratedAuthorNumber: Author | null;
  selectedAuthorNumberFromSelection: AuthorNumber;
  setAuthorNumberFromSelection: (authorNumber: AuthorNumber) => void;
  unSelectAuthorNumberSelection: () => void;
  unSelectAuthorFromGeneratedAuthorNumber: () => void;
}
export const useBookEditFormContext = () => {
  return useContext(BookEditFormContext);
};

const INITIAL_FORM_DATA_FALLBACK = {
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
};

export const BookEditFormProvider: React.FC<BaseProps> = ({ children }) => {
  const [authorFromGeneratedAuthorNumber, setAuthorFromGeneratedAuthorNumber] =
    useState<Author | null>(null);
  const navigate = useNavigate();
  const DEFAULT_AUTHOR_NUMBER = {
    id: 0,
    number: 0,
    surname: "",
  };
  const { id: bookId } = useParams();
  const fetchBook = async () => {
    const { data: response } = await axiosClient.get(`/books/${bookId}`);
    return response?.data?.book ?? {};
  };

  const [selectedAuthorNumberFromSelection, setAuthorNumberFromSelection] =
    useState<AuthorNumber>(DEFAULT_AUTHOR_NUMBER);

  const unSelectAuthorNumberSelection = () => {
    setAuthorNumberFromSelection({ ...DEFAULT_AUTHOR_NUMBER });
  };
  const unSelectAuthorFromGeneratedAuthorNumber = () => {
    setAuthorFromGeneratedAuthorNumber(null);
  };

  const formClient = useForm<EditBookForm>({
    initialFormData: INITIAL_FORM_DATA_FALLBACK,
    schema: NewBookSchemaValidation,
    scrollToError: true,
  });

  const { isFetchedAfterMount } = useQuery<EditBookForm>({
    queryFn: fetchBook,
    queryKey: ["book"],
    staleTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: (data) => {
      console.log(data);
      formClient.setForm(() => ({ ...data }));
    },
    onError: () => {
      {
        navigate("/void");
      }
    },
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
    <BookEditFormContext.Provider
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
      {isFetchedAfterMount && children}
    </BookEditFormContext.Provider>
  );
};
