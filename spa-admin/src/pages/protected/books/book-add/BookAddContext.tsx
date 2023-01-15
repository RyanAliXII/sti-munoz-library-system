import { BaseProps } from "@definitions/props.definition";
import { Book, Author } from "@definitions/types";
import { useForm, useFormType } from "@hooks/useForm";
import React, {
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { BookSchema } from "../schema";

export const BookAddContext = createContext({} as BookAddContextType);

type BookAddContextType = {
  form: Omit<Book, "id">;
  setForm: React.Dispatch<SetStateAction<Omit<Book, "id">>>;
  authorGeneratedFrom: Author | null;
  resetGeneratedFrom: () => void;
  formClient: useFormType<Omit<Book, "id">>;
  setGeneratedFrom: (author: Author) => void;
};
export const useBookAddContext = () => {
  return useContext(BookAddContext);
};
export const BookAddProvider: React.FC<BaseProps> = ({ children }) => {
  const [authorGeneratedFrom, setAuthorGeneratedFrom] = useState<Author | null>(
    null
  );
  const client = useForm<Omit<Book, "id">>({
    default: {
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

  const { form, setForm } = client;
  const resetGeneratedFrom = () => {
    setAuthorGeneratedFrom(() => null);
  };
  const setGeneratedFrom = (author: Author) => {
    setAuthorGeneratedFrom(() => author);
  };
  return (
    <BookAddContext.Provider
      value={{
        form,
        formClient: client,
        setForm,
        resetGeneratedFrom,
        authorGeneratedFrom,
        setGeneratedFrom,
      }}
    >
      {children}
    </BookAddContext.Provider>
  );
};
