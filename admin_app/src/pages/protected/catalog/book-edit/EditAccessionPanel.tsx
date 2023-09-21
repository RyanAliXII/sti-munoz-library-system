import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { useBookEditFormContext } from "./BookEditFormContext";
import { CiCircleRemove } from "react-icons/ci";
import { BsFillTrashFill } from "react-icons/bs";
import Tippy from "@tippyjs/react";
import { ButtonClasses, PrimaryButton } from "@components/ui/button/Button";
import { AiOutlinePlus } from "react-icons/ai";
import { useSwitch } from "@hooks/useToggle";
import {
  ConfirmDialog,
  DangerConfirmDialog,
  PromptInputDialog,
  PromptTextAreaDialog,
} from "@components/ui/dialog/Dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { Accession } from "@definitions/types";
import { GiRecycle } from "react-icons/gi";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { text } from "stream/consumers";
import { useForm } from "@hooks/useForm";
import { number, object, string } from "yup";

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
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
      <div className="w-full flex justify-between mb-5">
        <h1 className="text-2xl">Accessions</h1>
        <PrimaryButton
          className="flex items-center gap-2"
          onClick={() => {
            openAddCopyDialog();
          }}
        >
          <AiOutlinePlus />
          Add Copy
        </PrimaryButton>
      </div>

      <div>
        <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Accession Number</Th>
                <Th>Copy Number</Th>
                <Th>Status</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {accessions?.map((accession) => {
                return (
                  <BodyRow key={accession.id}>
                    <Td>{accession.number}</Td>
                    <Td>{accession.copyNumber}</Td>
                    <Td>
                      {accession.isWeeded ? (
                        <span className="text-red-400">Weeded</span>
                      ) : (
                        <span className="text-green-500">Active</span>
                      )}
                    </Td>
                    <Td>
                      {!accession.isWeeded && (
                        <Tippy content="Weed book">
                          <button
                            className={
                              ButtonClasses.DangerButtonOutlineClasslist
                            }
                            onClick={() => {
                              setSelectedAccession(accession?.id ?? "");
                              openWeedingDialog();
                            }}
                          >
                            <BsFillTrashFill className="text-lg text-red-400" />
                          </button>
                        </Tippy>
                      )}
                      {accession.isWeeded && (
                        <Tippy content="Re-circulate book">
                          <button
                            className="p-2 border border-green-500 rounded"
                            onClick={() => {
                              setSelectedAccession(accession?.id ?? "");
                              openRecirculateConfirmation();
                            }}
                          >
                            <GiRecycle className="text-lg text-green-500" />
                          </button>
                        </Tippy>
                      )}
                    </Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
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
          closeAddCopyDialog();
          try {
            const parsed = await validate();
            newCopies.mutate(parsed ?? { copies: 0 });
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
    </div>
  );
};

export default EditAccessionPanel;
