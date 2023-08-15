import { BookAddFormProvider } from "./BookAddFormContext";
import BookAddForm from "./BookAddForm";

const BookAddPage = () => {
  return (
    <BookAddFormProvider>
      <BookAddForm />
    </BookAddFormProvider>
  );
};

export default BookAddPage;
