import {} from "@components/ui/form/Input";

import "react-datepicker/dist/react-datepicker.css";

import { BookEditFormProvider } from "./BookEditFormContext";
import BookAddForm from "./BookEditForm";

const BookEditPage = () => {
  return (
    <BookEditFormProvider>
      <BookAddForm></BookAddForm>
    </BookEditFormProvider>
  );
};

export default BookEditPage;
