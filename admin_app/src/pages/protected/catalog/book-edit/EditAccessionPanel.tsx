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
import { PrimaryButton } from "@components/ui/button/Button";
import { AiOutlinePlus } from "react-icons/ai";
import { useSwitch } from "@hooks/useToggle";
import {
  ConfirmDialog,
  DangerConfirmDialog,
} from "@components/ui/dialog/Dialog";

const EditAccessionPanel = () => {
  const { form: Book } = useBookEditFormContext();
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
            {Book.accessions?.map((accession) => {
              return (
                <BodyRow key={accession.id}>
                  <Td>{accession.number}</Td>
                  <Td>{accession.copyNumber}</Td>
                  <Td>Active</Td>
                  <Td>
                    <Tippy content="Weed book">
                      <button
                        onClick={() => {
                          openWeedingConfirmation();
                        }}
                      >
                        <BsFillTrashFill className="text-lg text-red-400" />
                      </button>
                    </Tippy>
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </div>
      <DangerConfirmDialog
        close={closeWeedingConfirmation}
        isOpen={isWeedingConfirmationOpen}
        title="Weed Book!"
        text="Are you sure you want to weed this book?"
      />
      <ConfirmDialog
        close={closeAddCopyConfirmation}
        isOpen={isAddCopyConfirmationOpen}
        title="New Copy!"
        text="Are you sure you want to add new copy? This action is irreversible."
      />
    </div>
  );
};

export default EditAccessionPanel;
