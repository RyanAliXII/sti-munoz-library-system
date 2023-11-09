import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { LibraryStats } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { BiMoney } from "react-icons/bi";
import { FaUserFriends } from "react-icons/fa";
import { ImBooks } from "react-icons/im";
import { Link } from "react-router-dom";
const Dashboard = () => {
  const { Get } = useRequest();
  const fetchStats = async () => {
    try {
      const response = await Get("/stats/", {});
      const { data } = response.data;
      return (
        data?.stats ?? {
          accounts: 0,
          books: 0,
          penalties: 0,
          settledPenalties: 0,
          unsettledPenalties: 0,
          pendingBooks: 0,
          approvedBooks: 0,
          checkedOutBooks: 0,
          returnedBooks: 0,
          unreturnedBooks: 0,
          cancelledBooks: 0,
        }
      );
    } catch (err) {
      return {
        accounts: 0,
        books: 0,
        penalties: 0,
        settledPenalties: 0,
        unsettledPenalties: 0,
        pendingBooks: 0,
        approvedBooks: 0,
        checkedOutBooks: 0,
        returnedBooks: 0,
        unreturnedBooks: 0,
        cancelledBooks: 0,
      };
    }
  };
  const { data: stats } = useQuery<LibraryStats>({
    queryFn: fetchStats,
    queryKey: ["libraryStats"],
  });
  if (!stats)
    return (
      <>
        <Container className="ml-1">
          <h1 className="text-2xl">Dashboard</h1>
        </Container>
      </>
    );
  return (
    <>
      <Container className="h-screen">
        <h1 className="text-2xl font-semibold py-3 text-gray-900 dark:text-gray-50">
          Dashboard
        </h1>
        <div className="grid grid-cols-2 w-full gap-5 lg:grid-cols-3">
          <Link
            to="/books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow dark:bg-gray-700 dark:border-none dark:text-gray-50"
          >
            <ImBooks className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.books}
            </span>
            <small className="lg:text-lg text-center">Books</small>
          </Link>
          <Link
            to="/clients/accounts"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow dark:bg-gray-700 dark:border-none text-indigo-500"
          >
            <FaUserFriends className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.accounts}
            </span>
            <small className="lg:text-lg text-center">Accounts</small>
          </Link>
          <Link
            to="/circulation/penalties"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow  text-orange-500 dark:bg-gray-700 dark:border-none"
          >
            <BiMoney className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              PHP{" "}
              {stats.penalties.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
            <small className="lg:text-lg text-center">Total Penalties</small>
          </Link>
          <Link
            to="/circulation/penalties"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-red-500 dark:bg-gray-700 dark:border-none"
          >
            <BiMoney className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              PHP{" "}
              {stats.unsettledPenalties.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
            <small className="lg:text-lg text-center">
              Unsettled Penalties
            </small>
          </Link>
          <Link
            to="/circulation/penalties"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-green-500 dark:bg-gray-700 dark:border-none"
          >
            <BiMoney className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              PHP{" "}
              {stats.settledPenalties.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
            <small className="lg:text-lg text-center">Settled Penalties</small>
          </Link>
        </div>
      </Container>
    </>
  );
};

export default Dashboard;
