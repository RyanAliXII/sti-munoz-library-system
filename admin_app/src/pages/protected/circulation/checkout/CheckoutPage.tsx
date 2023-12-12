import { useState } from "react";
import { Account, Book, DetailedAccession } from "@definitions/types";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@hooks/useForm";
import Container from "@components/ui/container/Container";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import { BookInitialValue } from "@definitions/defaults";
import { ErrorMsg } from "@definitions/var";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { toast } from "react-toastify";
import { CheckoutSchemaValidation } from "../schema";
import BookCopySelectionModal from "./BookCopySelection";
import BookSearchBox from "./BookSearchBox";
import ClientSearchBox from "./ClientSearchBox";
import { ConfirmDialog } from "@components/ui/dialog/Dialog";
import Tippy from "@tippyjs/react";
import { format } from "date-fns";
import { Avatar, Button, Table } from "flowbite-react";
import { MdOutlineRemoveCircle } from "react-icons/md";

export interface CheckoutAccession extends DetailedAccession {
  dueDate: string;
}

export type BorrowedEbook = {
  bookTitle: string;
  bookId: string;
  dueDate: string;
};
export type CheckoutForm = {
  client: Account;
  accessions: CheckoutAccession[];
  ebooks: BorrowedEbook[];
};

const CLIENT_INITIAL_DATA: Account = {
  displayName: "",
  programCode: "",
  programName: "",
  userType: "",
  studentNumber: "",
  email: "",
  givenName: "",
  surname: "",
  id: "",
  isActive: false,
  isDeleted: false,
  userGroup: {
    hasProgram: false,
    id: 0,
    maxAllowedBorrowedBooks: 0,
    name: "",
  },
  metadata: {
    approvedBooks: 0,
    cancelledBooks: 0,
    checkedOutBooks: 0,
    pendingBooks: 0,
    returnedBooks: 0,
    totalPenalty: 0,
  },
};
const CheckoutPage = () => {
  const {
    open: openCheckoutConfirmation,
    close: closeCheckoutConfirmation,
    isOpen: isCheckoutConfirmationOpen,
  } = useSwitch();

  const {
    setForm,
    form: checkout,
    validate,
    resetForm,
    errors,
    removeFieldError,
    setFieldValue,
  } = useForm<CheckoutForm>({
    initialFormData: {
      accessions: [],
      ebooks: [],
      client: CLIENT_INITIAL_DATA,
    },
    scrollToError: false,
    schema: CheckoutSchemaValidation,
  });

  const setClient = (account: Account) => {
    removeFieldError("client");
    setForm((prevForm) => ({ ...prevForm, client: account }));
  };
  const removeClient = () => {
    setFieldValue("client", CLIENT_INITIAL_DATA);
  };
  const updateAccessionsToBorrow = (accessions: CheckoutAccession[]) => {
    setForm((prevForm) => ({
      ...prevForm,
      accessions: [...accessions],
    }));
  };
  const updateEbooksToBorrow = (ebooks: BorrowedEbook[]) => {
    setForm((prevForm) => ({
      ...prevForm,
      ebooks: ebooks,
    }));
  };
  const [selectedBook, setSelectedBook] = useState<Book>(BookInitialValue);

  const {
    close: closeCopySelection,
    isOpen: isCopySelectionOpen,
    open: openCopySelection,
  } = useSwitch();

  const selectBook = (book: Book) => {
    removeFieldError("accessions");
    setSelectedBook({ ...book });
    openCopySelection();
  };
  const removeAccession = (accession: DetailedAccession) => {
    setForm((prevForm) => ({
      ...prevForm,
      accessions: prevForm.accessions.filter(
        (a) => a.bookId === accession.bookId && a.number != accession.number
      ),
    }));
  };
  const proceedCheckout = async () => {
    try {
      const data = await validate();
      if (!data) return;
      submitCheckout.mutate(data);
      closeCheckoutConfirmation();
    } catch (err) {}
  };
  const { Post } = useRequest();
  const submitCheckout = useMutation({
    mutationFn: (formData: CheckoutForm) =>
      Post(
        "/borrowing/",
        {
          clientId: formData.client.id,
          accessions: formData.accessions,
          ebooks: formData.ebooks,
        },
        {}
      ),
    onSuccess: () => {
      toast.success("Books has been checkout successfully.");
    },
    onError: () => {
      toast.error(ErrorMsg.New);
    },
    onSettled: () => {
      resetForm();
    },
  });
  const removeEbook = (bookId: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      ebooks: prevForm.ebooks.filter((ebook) => ebook.bookId != bookId),
    }));
  };
  const validateAndOpenConfirm = async () => {
    try {
      const data = await validate();
      if (!data) return;

      if (data.accessions.length === 0 && data.ebooks.length === 0) {
        throw "Book is required.";
      }
      openCheckoutConfirmation();
    } catch (err) {
      toast.error("Client and book is required.");
    }
  };

  const avatarUrl = new URL(
    "https://ui-avatars.com/api/&background=2563EB&color=fff"
  );
  avatarUrl.searchParams.set(
    "name",
    `${checkout.client.givenName} ${checkout.client.surname}`
  );
  return (
    <>
      <Container>
        <div>
          <ClientSearchBox setClient={setClient} />
        </div>
        <small className="text-red-500 ml-0.5">{errors?.client?.id}</small>
        {checkout.client.id?.length ?? 0 > 0 ? (
          <div className="flex  px-4 py-6 gap-5">
            <div>
              <div className="flex gap-5">
                <div>
                  <Avatar rounded img={avatarUrl.toString()} />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-bold dark:text-gray-100">
                    {checkout.client.displayName}
                  </span>
                  <small className="text-gray-300">
                    {checkout.client.email}
                  </small>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <IoIosRemoveCircleOutline
                className="text-red-400 cursor-pointer text-2xl"
                onClick={removeClient}
              />
            </div>
          </div>
        ) : (
          <div className="px-2 py-4 mt-5 ">
            <span className="text-sm text-gray-500 dark:text-gray-100">
              No client selected.
            </span>{" "}
          </div>
        )}
      </Container>

      <Container>
        {/* <Divider
          heading="h2"
          headingProps={{ className: "text-xl" }}
          hrProps={{ className: "mb-5" }}
        >
          Select Books
        </Divider> */}
        <div>
          <BookSearchBox selectBook={selectBook} />
        </div>
        <small className="text-red-500 ml-0.5">{errors?.books}</small>
        {checkout.accessions.length > 0 || checkout.ebooks.length > 0 ? (
          <Container className="mx-0 mt-5 lg:w-full">
            <Table>
              <Table.Head>
                <Table.HeadCell>Book title</Table.HeadCell>
                <Table.HeadCell>Copy number</Table.HeadCell>
                <Table.HeadCell>Accession number</Table.HeadCell>
                <Table.HeadCell>Due Date</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {checkout.accessions?.map((accession) => {
                  return (
                    <Table.Row key={accession.id}>
                      <Table.Cell>{accession.book.title}</Table.Cell>
                      <Table.Cell>{accession.copyNumber}</Table.Cell>
                      <Table.Cell>{accession.number}</Table.Cell>
                      <Table.Cell>
                        <CustomDatePicker
                          name="dueDate"
                          value={new Date(accession.dueDate).toDateString()}
                          selected={new Date(accession.dueDate)}
                          onChange={(date) => {
                            if (!date) return;
                            const dateValue = format(date, "yyyy-MM-dd");
                            console.log(dateValue);
                            setForm((prev) => ({
                              ...prev,
                              accessions: prev.accessions.map((a) => {
                                if ((a.id = accession.id)) {
                                  return { ...a, dueDate: dateValue };
                                }
                                return a;
                              }),
                            }));
                          }}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Tippy content="Remove Book">
                          <button>
                            <MdOutlineRemoveCircle
                              className="text-red-400 cursor-pointer text-2xl"
                              onClick={() => {
                                removeAccession(accession);
                              }}
                            />
                          </button>
                        </Tippy>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
                {checkout.ebooks.map((eBook) => {
                  return (
                    <Table.Row key={eBook.bookId}>
                      <Table.Cell>{eBook.bookTitle}</Table.Cell>
                      <Table.Cell>N/A</Table.Cell>
                      <Table.Cell>N/A</Table.Cell>
                      <Table.Cell>
                        <CustomDatePicker
                          name="dueDate"
                          error={errors?.dueDate}
                          value={new Date(eBook.dueDate).toDateString()}
                          selected={new Date(eBook.dueDate)}
                          onChange={(date) => {
                            if (!date) return;
                            const dateValue = format(date, "yyyy-MM-dd");
                            setForm((prev) => ({
                              ...prev,
                              ebooks: prev.ebooks.map((b) => {
                                if (b.bookId == eBook.bookId) {
                                  return { ...b, dueDate: dateValue };
                                }
                                return b;
                              }),
                            }));
                          }}
                        />
                      </Table.Cell>

                      <Table.Cell>
                        <Tippy content="Remove Book">
                          <button>
                            <MdOutlineRemoveCircle
                              className="text-red-400 cursor-pointer text-2xl"
                              onClick={() => {
                                removeEbook(eBook.bookId);
                              }}
                            />
                          </button>
                        </Tippy>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </Container>
        ) : (
          <div className="px-2 py-4 mt-5 ">
            <span className="text-sm text-gray-500 dark:text-gray-100">
              No books selected.
            </span>
          </div>
        )}
        <div>
          <div className="py-7">
            <Button
              isProcessing={submitCheckout.isLoading}
              disabled={
                checkout.client.id?.length === 0 ||
                (checkout.accessions.length === 0 &&
                  checkout.ebooks.length === 0)
              }
              color="primary"
              onClick={validateAndOpenConfirm}
            >
              Proceed to checkout
            </Button>
          </div>
        </div>
      </Container>

      <ConfirmDialog
        isOpen={isCheckoutConfirmationOpen}
        key={"forConfirmation"}
        close={closeCheckoutConfirmation}
        onConfirm={proceedCheckout}
        title="Checkout books?"
        text="Are you want to checkout books?"
      />
      <BookCopySelectionModal
        book={selectedBook}
        closeModal={closeCopySelection}
        isOpen={isCopySelectionOpen}
        updateEbooksToBorrow={updateEbooksToBorrow}
        updateAccessionsToBorrow={updateAccessionsToBorrow}
        form={checkout}
      />
    </>
  );
};

export default CheckoutPage;
