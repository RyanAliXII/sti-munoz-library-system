const HOST = import.meta.env.PROD
  ? "https://sti-munoz-library.online:5200"
  : "http://localhost:5200";
export const BASE_URL_V1 = `${HOST}/api/1`;
