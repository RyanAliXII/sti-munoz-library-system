import ReactDOM from "react-dom/client";
import App from "./App";
import { StrictMode } from "react";
import { Flowbite } from "flowbite-react";
import theme from "./flowbite-theme";
const themeValue = localStorage.getItem("theme");
const mode= themeValue ===  "dark" ? "dark" : "light";
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Flowbite theme={{ theme, mode: mode }}>
      <App />
    </Flowbite>
  </StrictMode>
);
