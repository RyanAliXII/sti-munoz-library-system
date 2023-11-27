import Container from "@components/ui/container/Container";
import { BorrowedSection, LibraryStats, WalkInLog } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { BiMoney } from "react-icons/bi";
import { FaUserFriends } from "react-icons/fa";
import { ImBooks } from "react-icons/im";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { toReadableDate } from "@helpers/datetime";
import { Button, Card } from "flowbite-react";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { Get } = useRequest();
  const [walkInStats, setWalkInStats] = useState<WalkInLog[]>([]);
  const [borrowedSections, setBorrowedSections] = useState<BorrowedSection[]>(
    []
  );
  const [isMonthlyWalkInStats, setIsMonthlyWalkInStats] =
    useState<boolean>(true);
  const [isMonthlyBorrowedSection, setIsMonthlyBorrowedSection] =
    useState(true);
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
          weeklyWalkIns: [],
          monthlyWalkIns: [],
          monthlyBorrowedSections: [],
          weeklyBorrowedSections: [],
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
        weeklyWalkIns: [],
        monthlyWalkIns: [],
        monthlyBorrowedSections: [],
        weeklyBorrowedSections: [],
      };
    }
  };
  const { data: stats } = useQuery<LibraryStats>({
    queryFn: fetchStats,
    queryKey: ["libraryStats"],
    onSuccess: (data) => {
      setWalkInStats(data.monthlyWalkIns);
      setIsMonthlyWalkInStats(true);
      setBorrowedSections(data.monthlyBorrowedSections);
      setIsMonthlyBorrowedSection(true);
    },
  });
  if (!stats)
    return (
      <>
        <Container className="ml-1">
          <h1 className="text-2xl">Dashboard</h1>
        </Container>
      </>
    );

  const toWeeklyWalkIns = () => {
    setWalkInStats(stats.weeklyWalkIns);
    setIsMonthlyWalkInStats(false);
  };
  const toMonthlyWalkIns = () => {
    setWalkInStats(stats.monthlyWalkIns);
    setIsMonthlyWalkInStats(true);
  };
  const toWeeklyBorrowedSection = () => {
    setBorrowedSections(stats.weeklyBorrowedSections);
    setIsMonthlyBorrowedSection(false);
  };
  const toMonthlyBorrowedSection = () => {
    setBorrowedSections(stats.monthlyBorrowedSections);
    setIsMonthlyBorrowedSection(true);
  };
  const data = {
    labels: walkInStats.map((w) => toReadableDate(w.date)),
    datasets: [
      {
        label: "Statistics",
        data: walkInStats.map((w) => w.walkIns),
        backgroundColor: ["#0288D1", "#F4D03F"],
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Client Statistics",
      },
    },
  };

  const borrowedSectionData = {
    labels: borrowedSections.map((s) => s.name),
    datasets: [
      {
        label: "Borrowed Books Per Section",
        data: borrowedSections.map((s) => s.total),
        backgroundColor: ["#0288D1", "#F4D03F", "#28B463"],
      },
    ],
  };

  return (
    <>
      <Container>
        <h1 className="text-2xl font-semibold py-3 text-gray-900 dark:text-gray-50">
          Dashboard
        </h1>
        <div className="grid grid-cols-2 w-full gap-5 lg:grid-cols-3">
          <Link
            to="/books"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow dark:bg-transparent dark:border-gray-700 dark:text-gray-50"
          >
            <ImBooks className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.books}
            </span>
            <small className="lg:text-lg text-center">Books</small>
          </Link>
          <Link
            to="/clients/accounts"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow dark:bg-transparent dark:border-gray-700 text-indigo-500"
          >
            <FaUserFriends className="text-3xl lg:text-4xl" />
            <span className="text-xl  font-bold break-words text-center lg:text-2xl ">
              {stats.accounts}
            </span>
            <small className="lg:text-lg text-center">Accounts</small>
          </Link>
          <Link
            to="/circulation/penalties"
            className="flex flex-col px-20  items-center rounded py-5 justify-center gap-2  border border-gray-50 shadow  text-orange-500 dark:bg-transparent dark:border-gray-700"
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

          {/* <Link
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
          </Link> */}
        </div>
        <div className="flex-col 2xl:flex-row flex gap-2">
          <Card
            className="mt-3 flex-1"
            style={{
              maxWidth: "900px",
            }}
          >
            <div className="flex gap-2 p-2">
              <Button
                color={isMonthlyWalkInStats ? "primary" : "light"}
                onClick={toMonthlyWalkIns}
              >
                Monthly
              </Button>
              <Button
                color={!isMonthlyWalkInStats ? "primary" : "light"}
                onClick={toWeeklyWalkIns}
              >
                Weekly
              </Button>
            </div>
            <Bar data={data} options={options} />
          </Card>
          <Card
            className="mt-3 flex-1"
            style={{
              maxWidth: "400px",
            }}
          >
            <div className="flex gap-2 p-2">
              <Button
                color={isMonthlyBorrowedSection ? "primary" : "light"}
                onClick={toMonthlyBorrowedSection}
              >
                Monthly
              </Button>
              <Button
                color={!isMonthlyBorrowedSection ? "primary" : "light"}
                onClick={toWeeklyBorrowedSection}
              >
                Weekly
              </Button>
            </div>
            <Pie data={borrowedSectionData} />
          </Card>
        </div>
      </Container>
    </>
  );
};

export default Dashboard;
