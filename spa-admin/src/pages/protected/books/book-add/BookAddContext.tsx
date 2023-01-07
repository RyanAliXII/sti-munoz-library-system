import { BaseProps } from "@definitions/props.definition";
import { Author, BookType } from "@definitions/types";
import { createContext } from "react";

export const BookAddContext = createContext({} as BookAddContextType);

type BookAddContextType = {
  form: Omit<BookType, "id">;
};
interface BookAddProviderProps extends BaseProps {
  form: Omit<BookType, "id">;
}
export const BookAddProvider: React.FC<BookAddProviderProps> = ({
  children,
  form,
}) => {
  return (
    <BookAddContext.Provider value={{ form }}>
      {children}
    </BookAddContext.Provider>
  );
};
