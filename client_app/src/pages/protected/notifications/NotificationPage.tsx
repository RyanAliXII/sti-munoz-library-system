import { toReadableDatetime } from "@helpers/datetime";
import { useNotifications } from "@hooks/data-fetching/notification";
import React from "react";
import { Link } from "react-router-dom";

const NotificationPage = () => {
  const { data: notificatons } = useNotifications();
  return (
    <div className="py-4 w-11/12 mx-auto lg:w-9/12">
      <div className="overflow-x-auto">
        <table className="table w-full">
          {/* head */}
          <thead>
            <tr>
              <th>Message</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {notificatons?.map((n) => {
              return (
                <tr className="hover">
                  <td>
                    <Link
                      to={n.link}
                      className={`py-5 rounded flex-col items-start ${
                        n.link.length === 0 ? "pointer-events-none" : ""
                      }`}
                    >
                      {n.message}
                    </Link>
                  </td>
                  <td>{toReadableDatetime(n.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationPage;
