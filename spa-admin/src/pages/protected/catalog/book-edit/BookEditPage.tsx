import { BaseProps } from "@definitions/props.definition";

import {} from "@components/ui/form/Input";

import "react-datepicker/dist/react-datepicker.css";

import { BookEditFormProvider } from "./BookEditFormContext";
import BookAddForm from "./BookEditForm";

interface BookSuggestion {
  title: string;
  key: string;
  author_name: string[];
  cover: string;
  ddc: string[];
}
const BookEditPage = () => {
  return (
    <BookEditFormProvider>
      <BookAddForm></BookAddForm>
    </BookEditFormProvider>
  );
};

export default BookEditPage;
