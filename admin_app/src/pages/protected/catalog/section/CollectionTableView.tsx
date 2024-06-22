import HasAccess from "@components/auth/HasAccess";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import TableContainer from "@components/ui/table/TableContainer";
import { Section } from "@definitions/types";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { FC } from "react";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
type CollectionTableViewProps = {
  isLoading: boolean;
  isError: boolean;
  collections: Section[];
  initEdit: (collection: Section) => void;
  initDelete: (collection: Section) => void;
};
const CollectionTableView: FC<CollectionTableViewProps> = ({
  isError,
  isLoading,
  collections,
  initDelete,
  initEdit,
}) => {
  return (
    <LoadingBoundaryV2 isLoading={isLoading} isError={isError}>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Collection</Table.HeadCell>
            <Table.HeadCell>Sub-collection(Yes/No)</Table.HeadCell>
            <Table.HeadCell>Non-Circulating(Yes/No)</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {collections?.map((section) => {
              return (
                <Table.Row key={section.id}>
                  <Table.Cell>
                    <div className="text-gray-900 dark:text-white font-semibold ">
                      {section.name}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {section.isSubCollection ? (
                      <span className="text-green-600"> Yes</span>
                    ) : (
                      <span className="text-gray-600">No</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {section.isNonCirculating ? (
                      <span className="text-green-600"> Yes</span>
                    ) : (
                      <span className="text-gray-600">No</span>
                    )}
                  </Table.Cell>

                  <Table.Cell className="p-2 flex gap-2 items-center">
                    <HasAccess requiredPermissions={["Collection.Edit"]}>
                      <Tippy content="Edit">
                        <Button
                          onClick={() => {
                            initEdit(section);
                          }}
                          color="secondary"
                          size="xs"
                        >
                          <AiOutlineEdit className="cursor-pointer text-xl" />
                        </Button>
                      </Tippy>
                    </HasAccess>
                    <HasAccess requiredPermissions={["Collection.Delete"]}>
                      {section.isDeleteable && (
                        <Tippy content="Delete">
                          <Button
                            color="failure"
                            size="xs"
                            onClick={() => {
                              initDelete(section);
                            }}
                          >
                            <AiOutlineDelete className="cursor-pointer  text-xl" />
                          </Button>
                        </Tippy>
                      )}
                    </HasAccess>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
    </LoadingBoundaryV2>
  );
};

export default CollectionTableView;
