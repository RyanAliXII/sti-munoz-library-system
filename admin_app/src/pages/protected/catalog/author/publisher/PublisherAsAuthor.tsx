import LoadingBoundary from "@components/loader/LoadingBoundary";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { Publisher } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";

import { AiFillInfoCircle, AiOutlineRight } from "react-icons/ai";
import { BsArrowRight } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import { toast } from "react-toastify";

const PublisherAsAuthor = () => {
  const { Get } = useRequest();
  const fetchPublisher = async () => {
    try {
      const { data: response } = await Get("/publishers/");
      return response?.data?.publishers || [];
    } catch (error) {
      console.error(error);
      toast.error(ErrorMsg.Get);
    }
    return [];
  };

  const {
    data: publishers,
    isError,
    isFetching,
  } = useQuery<Publisher[]>({
    queryFn: fetchPublisher,
    queryKey: ["publishers"],
  });
  return (
    <>
      <div>
        <ContainerNoBackground className="flex gap-2">
          <div className="w-full py-5 bg-blue-100 rounded">
            <div className="flex justify-between gap-5 w-full">
              <div className="flex items-center gap-2">
                <AiFillInfoCircle className="text-xl text-blue-500 ml-2"></AiFillInfoCircle>
                <small className="text-blue-500">
                  This content is view only. If you wish to edit or delete the
                  data, you can go to publisher page.
                </small>
              </div>
              <div className="flex items-center gap-2 mr-5 text-blue-500 justify-self-end">
                <NavLink
                  to={"/books/publishers"}
                  className="text-xs font-semibold"
                >
                  Publisher Page
                </NavLink>
                <BsArrowRight className="font-semibold" />
              </div>
            </div>
          </div>
        </ContainerNoBackground>
        <LoadingBoundary isError={isError} isLoading={isFetching}>
          <Container className="lg:px-0">
            <div className="w-full">
              <Table>
                <Thead>
                  <HeadingRow>
                    <Th>Publisher</Th>
                  </HeadingRow>
                </Thead>
                <Tbody>
                  {publishers?.map((publisher) => {
                    return (
                      <BodyRow key={publisher.id}>
                        <Td>{publisher.name}</Td>
                      </BodyRow>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
          </Container>
        </LoadingBoundary>
      </div>
    </>
  );
};

export default PublisherAsAuthor;
