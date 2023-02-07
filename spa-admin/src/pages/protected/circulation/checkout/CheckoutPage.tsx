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
import { BaseSyntheticEvent, useEffect, useState } from "react";
import axiosClient from "@definitions/configs/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Accession,
  Account,
  Book,
  DetailedAccession,
} from "@definitions/types";

import { useForm } from "@hooks/useForm";
import ProfileIcon from "@components/ProfileIcon";

import { useSwitch } from "@hooks/useToggle";
import { toast } from "react-toastify";
import { CheckoutSchemaValidation } from "../../catalog/schema";
import { ErrorMsg } from "@definitions/var";
import ClientSearchBox from "./ClientSearchBox";
import BookCopySelectionModal from "./BookCopySelection";
import BookSearchBox from "./BookSearchBox";

export type CheckoutForm = {
  client: Account;
  accessions: DetailedAccession[];
};
const CheckoutPage = () => {
  const {
    setForm,
    form: checkout,
    validate,
    resetForm,
  } = useForm<CheckoutForm>({
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
    schema: CheckoutSchemaValidation,
  });
  const setClient = (account: Account) => {
    setForm((prevForm) => ({ ...prevForm, client: account }));
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

  const selectBookCopy = (book: Book) => {
    setSelectedBook({ ...book });
    openCopySelection();
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
