import { useBookEditFormContext } from "./BookEditFormContext";

import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import Container from "@components/ui/container/Container";
import {
  ConfirmDialog,
  PromptInputDialog,
  PromptTextAreaDialog,
} from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { Accession } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BsFillTrashFill } from "react-icons/bs";
import { GiRecycle } from "react-icons/gi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { number, object } from "yup";

enum Action {
  Weed = 1,
  Recirculate = 2,
}
type NewCopiesBody = {
  copies: number;
};
const EditAccessionPanel = () => {
  const [selectedAccession, setSelectedAccession] = useState<string>("");
  const { form: book } = useBookEditFormContext();
  const {
    close: closeWeedingDialog,
    open: openWeedingDialog,
    isOpen: isWeedingDialogOpen,
  } = useSwitch();
  const {
    close: closeAddCopyDialog,
    open: openAddCopyDialog,
    isOpen: isAddCopyDialogOpen,
  } = useSwitch();
  const {
    close: closeRecirculateConfirmation,
    open: openRecirculateConfirmation,
    isOpen: isReculateConfirmationOpen,
  } = useSwitch();
  const { Patch } = useRequest();
  const queryClient = useQueryClient();

  const { errors, handleFormInput, validate, removeFieldError } =
    useForm<NewCopiesBody>({
      initialFormData: {
        copies: 0,
      },
      schema: object({
        copies: number()
          .required("Number of copies is required.")
          .typeError("Number of copies is required.")
          .min(1, "Number of copies must be greater than zero."),
      }),
    });

  const newCopies = useMutation({
    mutationFn: (form: NewCopiesBody) =>
      Patch(`/books/${book.id}/copies`, form),
    onSuccess: () => {
      queryClient.invalidateQueries(["bookAccessions"]);
      toast.success("New copies has been added.");
    },
    onError: (data) => {
      console.error(data);
      toast.error("Unknown error occured.");
    },
  });
  const updateAccessionStatus = useMutation({
    mutationFn: ({ remarks, action }: { remarks?: string; action: Action }) =>
      Patch(
        `/books/accessions/${selectedAccession}/status`,
        {
          remarks: remarks ?? "",
        },
        {
          params: {
            action: action,
          },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["bookAccessions"]);
      toast.success("Book copy has been re-circulated.");
    },
    onError: (data) => {
      console.error(data);
      toast.error("Unknown error occured.");
    },
  });

  const { id } = useParams();
  const { Get } = useRequest();
  const fetchAccessions = async () => {
    try {
      const { data: response } = await Get(`/books/${id}/accessions`, {
        params: {
          ignoreWeeded: false,
        },
      });
      return response?.data?.accessions ?? [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const {
    data: accessions,
    isError,
    isFetching,
  } = useQuery<Accession[]>({
    queryFn: fetchAccessions,
    queryKey: ["bookAccessions"],
  });
  return (
    <Container>
      <div>
        <Button
          color="primary"
          onClick={() => {
            openAddCopyDialog();
          }}
        >
          <AiOutlinePlus />
          Add Copy
        </Button>
      </div>

      <div className="mt-4">
        <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
          <TableContainer>
            <Table>
              <Table.Head>
                <Table.HeadCell>Accession Number</Table.HeadCell>
                <Table.HeadCell>Copy Number</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {accessions?.map((accession) => {
                  return (
                    <Table.Row key={accession.id}>
                      <Table.Cell>{accession.number}</Table.Cell>
                      <Table.Cell>{accession.copyNumber}</Table.Cell>
                      <Table.Cell>
                        {accession.isWeeded ? (
                          <span className="text-red-400">Weeded</span>
                        ) : (
                          <span className="text-green-500">Active</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {!accession.isWeeded && (
                          <Tippy content="Weed book">
                            <Button
                              size={"xs"}
                              color="failure"
                              onClick={() => {
                                setSelectedAccession(accession?.id ?? "");
                                openWeedingDialog();
                              }}
                            >
                              <BsFillTrashFill className="text-lg" />
                            </Button>
                          </Tippy>
                        )}
                        {accession.isWeeded && (
                          <Tippy content="Re-circulate book">
                            <Button
                              size={"xs"}
                              color="success"
                              onClick={() => {
                                setSelectedAccession(accession?.id ?? "");
                                openRecirculateConfirmation();
                              }}
                            >
                              <GiRecycle className="text-lg" />
                            </Button>
                          </Tippy>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </TableContainer>
        </LoadingBoundaryV2>
      </div>
      <PromptTextAreaDialog
        key={"forWeeding"}
        close={closeWeedingDialog}
        isOpen={isWeedingDialogOpen}
        title="Weeding Remarks"
        label="Remarks"
        placeholder="Reason for weeding the book"
        proceedBtnText="Proceed"
        onProceed={(text) => {
          closeWeedingDialog();
          updateAccessionStatus.mutate({
            action: Action.Weed,
            remarks: text,
          });
        }}
      />

      <PromptInputDialog
        key={"forAddingCopy"}
        close={() => {
          removeFieldError("copies");
          closeAddCopyDialog();
        }}
        isOpen={isAddCopyDialogOpen}
        placeholder="copies"
        title="Add Copy"
        error={errors?.copies}
        inputProps={{
          label: "Number of copies",
          type: "number",
          name: "copies",
          onChange: handleFormInput,
          error: errors?.copies,
          placeholder: "Enter number of new copies to add",
        }}
        proceedBtnText="Proceed"
        onProceed={async () => {
          try {
            const parsed = await validate();
            newCopies.mutate(parsed ?? { copies: 0 });
            closeAddCopyDialog();
          } catch (error) {
            console.log(error);
          }
        }}
      />
      <ConfirmDialog
        key={"forRecirculate"}
        close={closeRecirculateConfirmation}
        isOpen={isReculateConfirmationOpen}
        title="Re-circulate book copy!"
        onConfirm={() => {
          closeRecirculateConfirmation();
          updateAccessionStatus.mutate({ action: Action.Recirculate });
        }}
        text="Are you sure you want to re-circulate this book? This copy will be available again?"
      />
    </Container>
  );
};

export default EditAccessionPanel;
