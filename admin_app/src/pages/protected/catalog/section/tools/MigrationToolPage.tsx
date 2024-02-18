import BookSearchBox from "@components/BookSearchBox";
import Container from "@components/ui/container/Container";
import { Book } from "@definitions/types";

const MigrationToolPage = () => {
  const onSelectBook = (book: Book) => {};
  return (
    <Container>
      <BookSearchBox
        label="Select books to migrate"
        selectBook={onSelectBook}
      />
    </Container>
  );
};

export default MigrationToolPage;
