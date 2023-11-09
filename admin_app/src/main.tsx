import ReactDOM from "react-dom/client";
import App from "./App";
import { StrictMode } from "react";
import { Flowbite } from "flowbite-react";
import theme from "./flowbite-theme";
const mode = localStorage.getItem("theme");
const isDark = mode === "dark" ? true : false;
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Flowbite theme={{ theme, dark: isDark }}>
      <App />
    </Flowbite>
  </StrictMode>
);
