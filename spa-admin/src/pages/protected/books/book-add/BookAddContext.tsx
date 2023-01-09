import { BaseProps } from "@definitions/props.definition";
import { BookType } from "@definitions/types";
import React, { SetStateAction, createContext } from "react";

export const BookAddContext = createContext({} as BookAddContextType);

type BookAddContextType = {
  form: Omit<BookType, "id">;
  setForm: React.Dispatch<SetStateAction<Omit<BookType, "id">>>;
};
interface BookAddProviderProps extends BaseProps {
  form: Omit<BookType, "id">;
  setForm: React.Dispatch<SetStateAction<Omit<BookType, "id">>>;
}
export const BookAddProvider: React.FC<BookAddProviderProps> = ({
  children,
  form,
  setForm,
}) => {
  return (
    <BookAddContext.Provider value={{ form, setForm }}>
      {children}
    </BookAddContext.Provider>
  );
};
