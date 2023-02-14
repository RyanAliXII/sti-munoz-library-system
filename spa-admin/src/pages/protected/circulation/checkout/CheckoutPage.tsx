import { PrimaryButton, SecondaryButton } from "@components/ui/button/Button";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { AiOutlineScan } from "react-icons/ai";

import { useState } from "react";
import axiosClient from "@definitions/configs/axios";
import { useMutation } from "@tanstack/react-query";
import { Account, Book, DetailedAccession } from "@definitions/types";

import { useForm } from "@hooks/useForm";
import ProfileIcon from "@components/ProfileIcon";

import { useSwitch } from "@hooks/useToggle";
import { toast } from "react-toastify";
import { CheckoutSchemaValidation } from "../schema";
import { ErrorMsg } from "@definitions/var";
import ClientSearchBox from "./ClientSearchBox";
import BookCopySelectionModal from "./BookCopySelection";
import BookSearchBox from "./BookSearchBox";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import Divider from "@components/ui/divider/Divider";
import { IoIosRemoveCircleOutline } from "react-icons/io";
export type CheckoutForm = {
  client: Account;
  accessions: DetailedAccession[];
  dueDate: string;
};

const CLIENT_INITIAL_DATA = {
  displayName: "",
  email: "",
  givenName: "",
  surname: "",
  id: "",
};
const CheckoutPage = () => {
  const getDate5DaysFromNow = (): Date => {
    let date = new Date();
    date.setDate(date.getDate() + 5);
    return date;
  };
  const {
    setForm,
    form: checkout,
    validate,
    resetForm,
    errors,
    setFieldValue,
  } = useForm<CheckoutForm>({
    initialFormData: {
      accessions: [],
      client: CLIENT_INITIAL_DATA,
      dueDate: getDate5DaysFromNow().toISOString(),
    },
    scrollToError: false,
    schema: CheckoutSchemaValidation,
  });

  const setClient = (account: Account) => {
    setForm((prevForm) => ({ ...prevForm, client: account }));
  };
  const removeClient = () => {
    setFieldValue("client", CLIENT_INITIAL_DATA);
  };
  const updateAccessionsToBorrow = (accessions: DetailedAccession[]) => {
    setForm((prevForm) => ({
      ...prevForm,
      accessions: [...accessions],
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

  const selectBook = (book: Book) => {
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
    } catch (err) {
      toast.error(
        "Checkout cannot proceed. Information might be invalid or not provided. Please select a client and books to borrow."
      );
    }
  };

  const submitCheckout = useMutation({
    mutationFn: (formData: CheckoutForm) =>
      axiosClient.post("/circulation/checkout", {
        clientId: formData.client.id,
        accessions: formData.accessions,
        dueDate: formData.dueDate,
      }),
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
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Borrow Book</h1>
      </ContainerNoBackground>
      <ContainerNoBackground className="px-4 py-6">
        <Divider
          heading="h2"
          headingProps={{ className: "text-xl" }}
          hrProps={{ className: "mb-5" }}
        >
          Select Client
        </Divider>
        <div className="w-full flex items-center gap-2">
          <ClientSearchBox setClient={setClient} form={checkout} />
          <SecondaryButton className="h-9 mt-6 flex justify-center">
            <AiOutlineScan className="text-white inline text-lg " />
          </SecondaryButton>
        </div>

        {checkout.client.id?.length ?? 0 > 0 ? (
          <div className="flex  px-4 py-6 gap-5">
            <div>
              <div className="flex gap-5">
                <div>
                  <ProfileIcon givenName="test" surname="test"></ProfileIcon>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600 font-bold">
                    {checkout.client.displayName}
                  </span>
                  <small className="text-gray-500">
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
            <span className="text-sm text-gray-500">No client selected.</span>{" "}
          </div>
        )}
      </ContainerNoBackground>
      <ContainerNoBackground className="p-4">
        <Divider
          heading="h2"
          headingProps={{ className: "text-xl" }}
          hrProps={{ className: "mb-5" }}
        >
          Select Books
        </Divider>
        <div className="w-full flex items-center gap-2">
          <BookSearchBox selectBook={selectBook} />
          <SecondaryButton className="h-9 mt-6 flex justify-center">
            <AiOutlineScan className="text-white inline text-lg " />
          </SecondaryButton>
        </div>
        {checkout.accessions.length > 0 ? (
          <Container className="mx-0 mt-5 lg:w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Book title</Th>
                  <Th>Copy number</Th>
                  <Th>Accession number</Th>
                  <Th>A</Th>
                </HeadingRow>
              </Thead>
              <Tbody>
                {checkout.accessions?.map((accession) => {
                  return (
                    <BodyRow
                      key={`${accession.bookId}_${accession.copyNumber}`}
                    >
                      <Td>{accession.title}</Td>
                      <Td>{accession.copyNumber}</Td>
                      <Td>{accession.number}</Td>
                      <Td>
                        <IoIosRemoveCircleOutline
                          className="text-red-400 cursor-pointer text-2xl"
                          onClick={() => {
                            removeAccession(accession);
                          }}
                        />
                      </Td>
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </Container>
        ) : (
          <div className="px-2 py-4 mt-5 ">
            <span className="text-sm text-gray-500">No books selected.</span>
          </div>
        )}
      </ContainerNoBackground>

      <ContainerNoBackground className="px-4 py-6">
        <Divider
          heading="h2"
          headingProps={{ className: "text-xl" }}
          hrProps={{ className: "mb-5" }}
        >
          Due date
        </Divider>
        <div>
          <CustomDatePicker
            name="dueDate"
            error={errors?.dueDate}
            minDate={new Date()}
            onChange={(date) => {
              if (!date) return;
              setForm((prevForm) => ({
                ...prevForm,
                dueDate: date.toISOString(),
              }));
            }}
            selected={new Date(checkout.dueDate)}
          />
        </div>
      </ContainerNoBackground>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5  flex gap-2">
        <PrimaryButton onClick={proceedCheckout}>
          Proceed to checkout
        </PrimaryButton>
      </div>
      <BookCopySelectionModal
        book={selectedBook}
        closeModal={closeCopySelection}
        isOpen={isCopySelectionOpen}
        updateAccessionsToBorrow={updateAccessionsToBorrow}
        form={checkout}
      />
    </>
  );
};

export default CheckoutPage;