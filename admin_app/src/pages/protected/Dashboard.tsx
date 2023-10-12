import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { LibraryStats } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";

import { FaHandHolding, FaUserFriends } from "react-icons/fa";
import { ImBooks } from "react-icons/im";
import { BiMoney } from "react-icons/bi";
import { Link } from "react-router-dom";
import { MdOutlinePending } from "react-icons/md";
import { AiFillBackward, AiFillCheckCircle } from "react-icons/ai";
import { BsArrowReturnLeft } from "react-icons/bs";
import { CiCircleRemove } from "react-icons/ci";

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
        <ContainerNoBackground className="ml-1">
          <h1 className="text-2xl">Dashboard</h1>
        </ContainerNoBackground>
      </>
    );
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-2xl font-semibold ml-5">Dashboard</h1>
      </ContainerNoBackground>
      <ContainerNoBackground>
        <div className="grid grid-cols-2 w-full gap-5 lg:grid-cols-3">
          <Link
            to="/books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow"
          >
            <ImBooks className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.books}
            </span>
            <small className="lg:text-lg text-center">Books</small>
          </Link>
          <Link
            to="/clients/accounts"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-indigo-500"
          >
            <FaUserFriends className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.accounts}
            </span>
            <small className="lg:text-lg text-center">Accounts</small>
          </Link>
          <Link
            to="/circulation/penalties"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-orange-500"
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
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-red-500"
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
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-green-500"
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
          <Link
            to="/circulation/online-borrowed-books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-gray-500"
          >
            <MdOutlinePending className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.pendingBooks}
            </span>
            <small className="lg:text-lg text-center">
              Pending Borrow Request
            </small>
          </Link>
          <Link
            to="/circulation/online-borrowed-books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-yellow-500"
          >
            <AiFillCheckCircle className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.approvedBooks}
            </span>
            <small className="lg:text-lg text-center">
              Approved Borrow Request
            </small>
          </Link>
          <Link
            to="/circulation/online-borrowed-books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-blue-500"
          >
            <FaHandHolding className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.checkedOutBooks}
            </span>
            <small className="lg:text-lg text-center">Checked-Out Books</small>
          </Link>

          <Link
            to="/circulation/online-borrowed-books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-green-400"
          >
            <BsArrowReturnLeft className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.returnedBooks}
            </span>
            <small className="lg:text-lg text-center">Returned Books</small>
          </Link>
          <Link
            to="/circulation/online-borrowed-books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-gray-500"
          >
            <CiCircleRemove className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.cancelledBooks}
            </span>
            <small className="lg:text-lg text-center">
              Cancelled Borrow Request
            </small>
          </Link>
          <Link
            to="/circulation/online-borrowed-books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow text-red-500"
          >
            <AiFillBackward className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.unreturnedBooks}
            </span>
            <small className="lg:text-lg text-center">Unreturned Books</small>
          </Link>
        </div>
      </ContainerNoBackground>
    </>
  );
};

export default Dashboard;
