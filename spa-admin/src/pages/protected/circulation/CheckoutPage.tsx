import {
  Input,
  InputClasses,
  PrimaryButton,
  SecondaryButton,
} from "@components/forms/Forms";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";
import { AiOutlineScan } from "react-icons/ai";
import Downshift from "downshift";
import { BaseSyntheticEvent, useState } from "react";
import axiosClient from "@definitions/configs/axios";
import { useQuery } from "@tanstack/react-query";
import {
  Accession,
  Account,
  Book,
  DetailedAccession,
  ModalProps,
} from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import { ClipLoader } from "react-spinners";
import { useForm } from "@hooks/useForm";
import ProfileIcon from "@components/ProfileIcon";
import Modal from "react-responsive-modal";
import { useSwitch } from "@hooks/useToggle";

type CheckoutForm = {
  client: Account;
  accessions: DetailedAccession[];
};
const CheckoutPage = () => {
  const { setForm, form: checkout } = useForm<CheckoutForm>({
    initialFormData: {
      accessions: [],
      client: {
        displayName: "",
        email: "",
        givenName: "",
        surname: "",
        id: "",
      },
    },
    scrollToError: false,
  });
  const [addedBooksCache, setAddedBookCache] = useState<Object>({});
  const setClient = (account: Account) => {
    setForm((prevForm) => ({ ...prevForm, client: account }));
  };
  const addAccessions = (accessions: DetailedAccession[]) => {
    setForm((prevForm) => ({
      ...prevForm,
      accessions: [...prevForm.accessions, ...accessions],
    }));
  };
  const [selectedBook, setSelectedBook] = useState<Book>({
    accessions: [],
    authorNumber: "",
    authors: [],
    copies: 0,
    costPrice: 0,
    createdAt: "",
    ddc: 0,
    description: "",
    edition: 0,
    fundSource: "",
    fundSourceId: 0,
    isbn: "",
    pages: 0,
    publisher: "",
    publisherId: 0,
    receivedAt: "",
    section: "",
    sectionId: 0,
    title: "",
    yearPublished: 0,
    id: "",
  });

  const {
    close: closeCopySelection,
    isOpen: isCopySelectionOpen,
    open: openCopySelection,
  } = useSwitch();

  const selectBookCopy = (book: Book) => {
    setSelectedBook({ ...book });
    openCopySelection();
  };
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5  flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Borrow Book</h1>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5  lg:rounded-md mx-auto mb-4 gap-2 border border-gray-100">
        <h2 className="text-xl mb-2"> Borrower</h2>
        <div className="w-full flex items-center gap-2">
          <ClientSearchBox setClient={setClient} />
          <SecondaryButton className="h-9 mt-6 flex justify-center">
            <AiOutlineScan className="text-white inline text-lg " />
          </SecondaryButton>
        </div>
        <div className="mt-5">
          <Table>
            <Thead>
              <HeadingRow>
                <Th></Th>
                <Th>Client</Th>
                <Th>Email</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {checkout.client?.id?.length ?? 0 > 0 ? (
                <BodyRow>
                  <Td>
                    <ProfileIcon
                      givenName={checkout.client.givenName}
                      surname={checkout.client.surname}
                    />
                  </Td>
                  <Td>{checkout.client.displayName}</Td>
                  <Td>{checkout.client.email}</Td>
                </BodyRow>
              ) : (
                <BodyRow>
                  <Td>
                    <span>No client selected.</span>
                  </Td>
                </BodyRow>
              )}
            </Tbody>
          </Table>
        </div>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5  lg:rounded-md mx-auto mb-4  gap-2 border border-gray-100">
        <h2 className="text-xl mb-2"> Books to borrow</h2>
        <div className="w-full flex items-center gap-2">
          <BookSearchBox selectBook={selectBookCopy} />
          <SecondaryButton className="h-9 mt-6 flex justify-center">
            <AiOutlineScan className="text-white inline text-lg " />
          </SecondaryButton>
        </div>
        <div className="mt-5">
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Book title</Th>
                <Th>Copy number</Th>
                <Th>Accession number</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {checkout.accessions?.map((accession) => {
                return (
                  <BodyRow key={`${accession.bookId}_${accession.copyNumber}`}>
                    <Td>{accession.title}</Td>
                    <Td>{accession.copyNumber}</Td>
                    <Td>{accession.number}</Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </div>
      </div>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5  flex gap-2">
        <PrimaryButton>Proceed to checkout</PrimaryButton>
      </div>
      <BookCopySelectionModal
        book={selectedBook}
        closeModal={closeCopySelection}
        isOpen={isCopySelectionOpen}
        addAccessions={addAccessions}
      />
    </>
  );
};

type ClientSearchBoxProps = {
  setClient: (account: Account) => void;
};
const ClientSearchBox = ({ setClient }: ClientSearchBoxProps) => {
  const [searchKeyword, setKeyword] = useState("");
  const debounce = useDebounce();
  const DELAY_IN_MILLISECOND = 500;
  const handleSearchBoxChange = (event: BaseSyntheticEvent) => {
    debounce(() => setKeyword(event.target.value), null, DELAY_IN_MILLISECOND);
  };
  const fetchAccounts = async () => {
    try {
      const { data: response } = await axiosClient.get("/clients/accounts", {
        params: {
          offset: 0,
          keyword: searchKeyword,
        },
      });
      return response?.data?.accounts ?? [];
    } catch {
      return [];
    }
  };
  const { data: accounts, isRefetching } = useQuery<Account[]>({
    refetchOnMount: false,
    initialData: [],
    queryKey: ["accounts", searchKeyword],
    queryFn: fetchAccounts,
  });
  return (
    <>
      <Downshift>
        {({ getInputProps, isOpen, closeMenu }) => (
          <div className="w-10/12  relative">
            <label className={InputClasses.LabelClasslist}>Search client</label>
            <input
              {...getInputProps({
                placeholder: "Enter client's surname, given name or email",
                onChange: handleSearchBoxChange,
                className: InputClasses.InputDefaultClasslist,
              })}
            />

            {isOpen && accounts.length > 0 ? (
              !isRefetching ? (
                <ul className="w-full absolute list-none max-h-80 bg-white overflow-y-auto cursor-pointer border mt-2 rounded z-10">
                  {accounts?.map((account) => {
                    return (
                      <li
                        key={account.id}
                        className="p-3 border flex flex-col"
                        onClick={() => {
                          closeMenu(() => {
                            setClient(account);
                          });
                        }}
                      >
                        <span className="text-gray-600">
                          {account.displayName}
                        </span>
                        <small className="text-gray-400">{account.email}</small>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="w-full absolute list-none h-52 overflow-y-auto cursor-pointer items-center flex justify-center bg-white border rounded mt-2">
                  <ClipLoader color="#C5C5C5" />
                </div>
              )
            ) : null}

            {isOpen && accounts.length === 0 ? (
              <div className="w-full absolute list-none h-52 bg-white overflow-y-auto cursor-pointer border mt-2 rounded flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                  No result found for {searchKeyword}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </Downshift>
    </>
  );
};
type BookSearchBoxProps = {
  selectBook: (book: Book) => void;
};
const BookSearchBox = ({ selectBook }: BookSearchBoxProps) => {
  const [searchKeyword, setKeyword] = useState("");
  const debounce = useDebounce();
  const DELAY_IN_MILLISECOND = 500;
  const handleSearchBoxChange = (event: BaseSyntheticEvent) => {
    debounce(() => setKeyword(event.target.value), null, DELAY_IN_MILLISECOND);
  };
  const fetchBooks = async () => {
    try {
      const { data: response } = await axiosClient.get("/books/", {
        params: {
          offset: 0,
          keyword: searchKeyword,
        },
      });
      return response?.data?.books ?? [];
    } catch {
      return [];
    }
  };
  const { data: books, isRefetching } = useQuery<Book[]>({
    refetchOnMount: false,
    initialData: [],
    queryKey: ["books", searchKeyword],
    queryFn: fetchBooks,
  });
  return (
    <>
      <Downshift>
        {({ getInputProps, isOpen, closeMenu }) => (
          <div className="w-10/12  relative ">
            <label className={InputClasses.LabelClasslist}>Search book</label>
            <input
              {...getInputProps({
                placeholder: "Enter book's title or description",
                onChange: handleSearchBoxChange,
                className: InputClasses.InputDefaultClasslist,
              })}
            />

            {isOpen && books.length > 0 ? (
              !isRefetching ? (
                <ul className="w-full absolute list-none max-h-80 bg-white overflow-y-auto cursor-pointer border mt-2 rounded">
                  {books?.map((book) => {
                    const authors = book.authors?.map((author) => {
                      return `${author.givenName} ${author.surname}`;
                    });

                    return (
                      <li
                        key={book.id}
                        className="p-3 border flex flex-col"
                        onClick={() => {
                          closeMenu(() => {
                            selectBook(book);
                          });
                        }}
                      >
                        <span className="text-gray-600">{book.title}</span>
                        <small className="text-gray-400">
                          ISBN: {book.isbn} | Authors: {authors.join(", ")}
                        </small>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="w-full absolute list-none h-52 overflow-y-auto cursor-pointer items-center flex justify-center bg-white border rounded mt-2">
                  <ClipLoader color="#C5C5C5" />
                </div>
              )
            ) : null}

            {isOpen && books.length === 0 ? (
              <div className="w-full absolute list-none h-52 bg-white overflow-y-auto cursor-pointer border mt-2 rounded flex items-center justify-center">
                <span className="text-gray-400 text-sm">
                  No result found for {searchKeyword}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </Downshift>
    </>
  );
};

interface BookCopySelectionProps extends ModalProps {
  book: Book;
  addAccessions: (accesions: DetailedAccession[]) => void;
}
const BookCopySelectionModal = ({
  closeModal,
  isOpen,
  book,
  addAccessions,
}: BookCopySelectionProps) => {
  const [selectedAccessions, setSelectedAccessions] = useState<
    DetailedAccession[]
  >([]);

  const handleCheck = (accession: Accession) => {
    setSelectedAccessions((prevSelected) => [
      ...prevSelected,
      {
        authorNumber: book.authorNumber,
        bookId: book.id ?? "",
        copyNumber: accession.copyNumber,
        number: accession.number,
        ddc: book.ddc,
        section: book.section,
        title: book.title,
        yearPublished: book.yearPublished,
      },
    ]);
  };
  const proceedToAdd = () => {
    addAccessions(selectedAccessions);
    closeModal();
  };
  if (!isOpen) return null;
  return (
    <Modal
      center
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      classNames={{
        modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded",
      }}
    >
      <div>
        <h1 className="mb-3">{book.title}</h1>
        <Table>
          <Thead>
            <HeadingRow>
              <Th></Th>
              <Th>Accession number</Th>
              <Th>Copy number</Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {book.accessions.map((accession) => {
              return (
                <BodyRow key={accession.number}>
                  <Td>
                    <Input
                      type="checkbox"
                      onChange={() => {
                        handleCheck(accession);
                      }}
                    />
                  </Td>
                  <Td>{accession.number}</Td>
                  <Td>Copy {accession.copyNumber}</Td>
                </BodyRow>
              );
            })}
            <BodyRow></BodyRow>
          </Tbody>
        </Table>
      </div>
      <PrimaryButton className="mt-5" onClick={proceedToAdd}>
        Add accession
      </PrimaryButton>
    </Modal>
  );
};
export default CheckoutPage;
