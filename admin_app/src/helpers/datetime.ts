export const to12HR = (time: string) => {
  try {
    const dateString = "1970-01-01 " + time;
    const date = new Date(dateString);
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return formattedTime;
  } catch (error) {
    return "";
  }
};

export const getTimeFromDate = (datetimeStr: string) => {
  try {
    const date = new Date(datetimeStr);
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return formattedTime;
  } catch (error) {
    return "";
  }
};

export const toReadableDate = (dateStr: string) => {
  if (dateStr.length === 0) return "";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
};

export const toReadableDatetime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
  });
};
