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
} from "@components/ui/dialog/Dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { Accession } from "@definitions/types";
import { GiRecycle } from "react-icons/gi";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
const EditAccessionPanel = () => {
  const [selectedAccession, setSelectedAccession] = useState<string>("");
  const {
    close: closeWeedingConfirmation,
    open: openWeedingConfirmation,
    isOpen: isWeedingConfirmationOpen,
  } = useSwitch();
  const {
    close: closeAddCopyConfirmation,
    open: openAddCopyConfirmation,
    isOpen: isAddCopyConfirmationOpen,
  } = useSwitch();
  const {
    close: closeRecirculateConfirmation,
    open: openRecirculateConfirmation,
    isOpen: isReculateConfirmationOpen,
  } = useSwitch();
  const { Delete, Patch } = useRequest();
  const queryClient = useQueryClient();
  const weedBook = useMutation({
    mutationFn: () => Delete(`/books/accessions/${selectedAccession}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["bookAccessions"]);
      toast.success("Book copy has been weeded.");
    },
    onError: (data) => {
      console.error(data);
      toast.error("Unknown error occured.");
    },
  });
  const recirculate = useMutation({
    mutationFn: () => Patch(`/books/accessions/${selectedAccession}`),
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
            openAddCopyConfirmation();
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
                              openWeedingConfirmation();
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
      <DangerConfirmDialog
        key={"forWeeding"}
        close={closeWeedingConfirmation}
        isOpen={isWeedingConfirmationOpen}
        title="Weed Book!"
        text="Are you sure you want to weed this book?"
        onConfirm={() => {
          closeWeedingConfirmation();
          weedBook.mutate();
        }}
      />
      <ConfirmDialog
        key={"forAddingCopy"}
        close={closeAddCopyConfirmation}
        isOpen={isAddCopyConfirmationOpen}
        title="New Copy!"
        text="Are you sure you want to add new copy? This action is irreversible."
      />
      <ConfirmDialog
        key={"forRecirculate"}
        close={closeRecirculateConfirmation}
        isOpen={isReculateConfirmationOpen}
        title="Re-circulate book copy!"
        onConfirm={() => {
          closeRecirculateConfirmation();
          recirculate.mutate();
        }}
        text="Are you sure you want to re-circulate this book? This copy will be available again?"
      />
    </div>
  );
};

export default EditAccessionPanel;
