import { BaseProps } from "@definitions/props.definition";
import { Book, AuthorNumber } from "@definitions/types";
import { useForm, UseFormType } from "@hooks/useForm";
import React, { createContext, useContext, useEffect, useState } from "react";
import { UpdateBookSchemaValidation } from "../schema";
import { SingleValue } from "react-select";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@definitions/configs/axios";

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
  ddc: 0,
  costPrice: 0,
  description: "",

  edition: 0,
  pages: 1,

  yearPublished: new Date().getFullYear(),
  createdAt: "",
  accessions: [],
};

export const BookEditFormProvider: React.FC<BaseProps> = ({ children }) => {
  const navigate = useNavigate();
  const { id: bookId } = useParams();
  const fetchBook = async () => {
    const { data: response } = await axiosClient.get(`/books/${bookId}`);
    return response?.data?.book ?? {};
  };

  const formClient = useForm<Book>({
    initialFormData: INITIAL_FORM_DATA,
    schema: UpdateBookSchemaValidation,
    scrollToError: true,
  });

  const { isFetchedAfterMount } = useQuery<Book>({
    queryFn: fetchBook,
    queryKey: ["book"],
    staleTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: (data) => {
      console.log(data);
      formClient.setForm({ ...data });
    },
    onError: () => {
      {
        navigate("/void");
      }
    },
  });

  return (
    <BookEditFormContext.Provider
      value={{
        ...formClient,
      }}
    >
      {isFetchedAfterMount && children}
    </BookEditFormContext.Provider>
  );
};
