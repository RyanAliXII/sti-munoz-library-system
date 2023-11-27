import Container from "@components/ui/container/Container";
import { LibraryStats, WalkInLog } from "@definitions/types";
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
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { toReadableDate } from "@helpers/datetime";
import { Button, Card } from "flowbite-react";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { Get } = useRequest();
  const [walkInStats, setWalkInStats] = useState<WalkInLog[]>([]);
  const [isMonthlyWalkInStats, setIsMonthlyWalkInStats] =
    useState<boolean>(true);
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
      };
    }
  };
  const { data: stats } = useQuery<LibraryStats>({
    queryFn: fetchStats,
    queryKey: ["libraryStats"],
    onSuccess: (data) => {
      setWalkInStats(data.monthlyWalkIns);
      setIsMonthlyWalkInStats(true);
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

        <Card
          className="mt-3"
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
      </Container>
    </>
  );
};

export default Dashboard;
