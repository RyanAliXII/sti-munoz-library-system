import { BorrowedBook, ModalProps } from "@definitions/types";
import {
  useBorrowedBookByScanning,
  useReturnBulk,
} from "@hooks/data-fetching/borrowing";
import { useDeviceScanner } from "@hooks/useDeviceScanner";
import { useForm } from "@hooks/useForm";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Label, Modal, Table, Textarea } from "flowbite-react";
import { FC, FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { parse } from "uuid";

type ReturnScanModalForm = {
  remarks: string;
  borrowedBooks: BorrowedBook[];
};
const ReturnScanModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  const [accessionId, setAccessionId] = useState<string>("");
  const { form, setForm, resetForm, handleFormInput } =
    useForm<ReturnScanModalForm>({
      initialFormData: {
        remarks: "",
        borrowedBooks: [],
      },
    });
  const borrowedBooksMap = form.borrowedBooks.reduce((a, borrowedBook) => {
    a.set(borrowedBook.accessionId, borrowedBook);
    return a;
  }, new Map<string, BorrowedBook>());
  const {} = useBorrowedBookByScanning({
    queryKey: ["borrowedBook", accessionId],
    onSuccess: (borrowedBook) => {
      if (borrowedBook.id.length === 0) return;

      setAccessionId("");
      setForm((prev) => ({
        ...prev,
        borrowedBooks: [...prev.borrowedBooks, borrowedBook],
      }));
    },
  });
  const queryClient = useQueryClient();
  const returnBulk = useReturnBulk({
    onSuccess: () => {
      toast.success("Books returned");
      resetForm();
      closeModal();

      queryClient.invalidateQueries(["transactions"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  useDeviceScanner({
    onScan: (text: string) => {
      try {
        parse(text);
        if (borrowedBooksMap.has(text)) return;
        setAccessionId(text);
      } catch {}
    },
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      if (form.borrowedBooks.length === 0) return;
      returnBulk.mutate({
        borrowedBookIds: form.borrowedBooks.map((b) => b.id),
        remarks: form.remarks,
      });
    } catch (err) {}
  };
  return (
    <Modal show={isOpen} onClose={closeModal} size="4xl">
      <Modal.Header>Scanned Books</Modal.Header>
      <form onSubmit={onSubmit}>
        <Modal.Body>
          <div className="py-2">
            <Label>Remarks</Label>
            <Textarea
              name="remarks"
              value={form.remarks}
              onChange={handleFormInput}
              className="resize-none"
              disabled={form.borrowedBooks.length === 0}
            ></Textarea>
          </div>
          <Table>
            <Table.Head>
              <Table.HeadCell>Book</Table.HeadCell>
              <Table.HeadCell>Accession Number</Table.HeadCell>
              <Table.HeadCell>Penalty</Table.HeadCell>
              <Table.HeadCell>Patron</Table.HeadCell>
            </Table.Head>
            <Table.Body style={{ minHeight: "50px" }}>
              {form.borrowedBooks?.map((bb) => {
                return (
                  <Table.Row key={bb.id}>
                    <Table.Cell>{bb.book.title}</Table.Cell>
                    <Table.Cell>{bb.accessionNumber}</Table.Cell>
                    <Table.Cell>{bb.penalty}</Table.Cell>
                    <Table.Cell>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {bb.client.givenName} {bb.client.surname}
                      </div>
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {bb.client.email}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            isProcessing={returnBulk.isLoading}
            disabled={form.borrowedBooks.length === 0}
            color="primary"
            type="submit"
            className="mt-2"
          >
            Return Books
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ReturnScanModal;
