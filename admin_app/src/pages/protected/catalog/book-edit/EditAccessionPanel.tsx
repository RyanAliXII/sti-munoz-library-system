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
import { AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import { FaQuestion, FaTimes, FaUndo } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { number, object } from "yup";
import EditAccessionModal from "./EditAccessionModal";

enum Action {
  Weed = 1,
  Recirculate = 2,
  Missing = 3,
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
  const [action, setAction] = useState<Action>(1);

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
  const editAccessionModal = useSwitch();
  const [accession, setAccession] = useState<Accession>({
    copyNumber: 0,
    isAvailable: false,
    isMissing: false,
    isWeeded: false,
    number: 0,
    remarks: "",
    id: "",
  });

  const initEdit = (accession: Accession) => {
    editAccessionModal.open();
    setAccession(accession);
  };
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
                <Table.HeadCell>Remarks</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {accessions?.map((accession) => {
                  return (
                    <Table.Row key={accession.id}>
                      <Table.Cell>{accession.number}</Table.Cell>
                      <Table.Cell>{accession.copyNumber}</Table.Cell>
                      <Table.Cell>
                        {accession.isWeeded || accession.isMissing ? (
                          <span className="text-red-400">
                            {accession.isWeeded ? "Weeded" : "Missing"}
                          </span>
                        ) : (
                          <span className="text-green-500">Active</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        {accession.isWeeded || accession.isMissing ? (
                          <span>{accession.remarks}</span>
                        ) : (
                          "N/A"
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          <Tippy content="Edit Accession">
                            <Button
                              color="primary"
                              outline={true}
                              onClick={() => {
                                initEdit(accession);
                              }}
                            >
                              <AiOutlineEdit />
                            </Button>
                          </Tippy>
                          {!accession.isWeeded && !accession.isMissing && (
                            <>
                              <Tippy content="Weed book">
                                <Button
                                  size={"xs"}
                                  color="failure"
                                  onClick={() => {
                                    setSelectedAccession(accession?.id ?? "");
                                    setAction(Action.Weed);
                                    openWeedingDialog();
                                  }}
                                >
                                  <FaTimes className="text-lg" />
                                </Button>
                              </Tippy>
                              <Tippy content="Mark as Missing ">
                                <Button
                                  size={"xs"}
                                  color="warning"
                                  onClick={() => {
                                    setSelectedAccession(accession?.id ?? "");
                                    setAction(Action.Missing);
                                    openWeedingDialog();
                                  }}
                                >
                                  <FaQuestion className="text-lg" />
                                </Button>
                              </Tippy>
                            </>
                          )}
                          {(accession.isWeeded || accession.isMissing) && (
                            <Tippy content="Undo Weeding/Missing">
                              <Button
                                size={"xs"}
                                color="success"
                                onClick={() => {
                                  setSelectedAccession(accession?.id ?? "");
                                  openRecirculateConfirmation();
                                }}
                              >
                                <FaUndo />
                              </Button>
                            </Tippy>
                          )}
                        </div>
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
        title="Missing/Weeding Remarks"
        label="Remarks"
        placeholder=""
        proceedBtnText="Save"
        onProceed={(text) => {
          closeWeedingDialog();
          updateAccessionStatus.mutate({
            action: action,
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
        title="Undo Book Status"
        onConfirm={() => {
          closeRecirculateConfirmation();
          updateAccessionStatus.mutate({ action: Action.Recirculate });
        }}
        text="Are you sure you want to undo this book status? This copy will be available again?"
      />
      <EditAccessionModal
        formData={accession}
        isOpen={editAccessionModal.isOpen}
        closeModal={editAccessionModal.close}
      />
    </Container>
  );
};

export default EditAccessionPanel;
