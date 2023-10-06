import { Table } from "./table";
const useCutter = () => {
  const removeAccent = (number: string) => {
    number = number.replace("Á", "A");
    number = number.replace("É", "E");
    number = number.replace("Í", "I");
    number = number.replace("Ó", "O");
    number = number.replace("Ú", "U");
    number = number.replace("Ü", "U");
    number = number.replace("á", "A");
    number = number.replace("é", "E");
    number = number.replace("í", "I");
    number = number.replace("ó", "O");
    number = number.replace("ú", "U");
    number = number.replace("ä", "A");
    number = number.replace("Ä", "A");
    number = number.replace("ë", "E");
    number = number.replace("Ë", "E");
    number = number.replace("ï", "I");
    number = number.replace("Ï", "I");
    number = number.replace("ö", "O");
    number = number.replace("Ö", "O");
    number = number.replace("ü", "U");
    number = number.replace("Ü", "U");
    number = number.replace("Ç", "C");
    number = number.replace("à", "A");
    number = number.replace("À", "A");
    number = number.replace("è", "E");
    number = number.replace("È", "E");
    number = number.replace("ì", "I");
    number = number.replace("Ì", "I");
    number = number.replace("ò", "O");
    number = number.replace("Ò", "O");
    number = number.replace("ù", "U");
    number = number.replace("Ù", "U");
    number = number.replace("â", "A");
    number = number.replace("Â", "A");
    number = number.replace("ê", "E");
    number = number.replace("Ê", "E");
    number = number.replace("î", "I");
    number = number.replace("Î", "I");
    number = number.replace("ô", "O");
    number = number.replace("Ô", "O");
    number = number.replace("û", "U");
    number = number.replace("Û", "U");
    number = number.replace("ñ", "NZ");
    return number;
  };
  const generate = (inputtxt: string) => {
    const original = inputtxt;
    const tblc = Table.split("\n");
    let cutter = "";
    inputtxt = removeAccent(inputtxt);
    inputtxt = inputtxt.replace(" ", "");
    inputtxt = inputtxt.trim();
    inputtxt = inputtxt.toLowerCase();
    for (let j = 0; j < tblc.length - 1; j++) {
      if (inputtxt >= tblc[j].slice(4) && inputtxt < tblc[j + 1].slice(4)) {
        if (
          inputtxt[0] == "a" ||
          inputtxt[0] == "e" ||
          inputtxt[0] == "i" ||
          inputtxt[0] == "o" ||
          inputtxt[0] == "u"
        ) {
          cutter = inputtxt.slice(0, 2).toUpperCase() + tblc[j].slice(0, 3);
        } else if (inputtxt[0] == "s" && inputtxt[1] != "c") {
          cutter = inputtxt.slice(0, 2).toUpperCase() + tblc[j].slice(0, 3);
        } else if (inputtxt[0] == "s" && inputtxt[1] == "c") {
          cutter = inputtxt.slice(0, 3).toUpperCase() + tblc[j].slice(0, 3);
        } else {
          cutter = inputtxt[0].toUpperCase() + tblc[j].slice(0, 3);
        }
        cutter = cutter.replace("0", "");
        cutter = cutter.replace("0", "");
        break;
      }
    }
    return cutter;
  };
  return generate;
};

export default useCutter;
