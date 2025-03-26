import type { CustomFlowbiteTheme } from "flowbite-react";
//
const flowbiteTheme: CustomFlowbiteTheme = {
  badge: {
    root: {
      color: {
        primary:
          "bg-primary-100 text-primary-800 dark:bg-primary-200 dark:text-primary-800 group-hover:bg-primary-200 dark:group-hover:bg-primary-300",
      },
      size: {
        xl: "px-3 py-2 text-base rounded-md",
      },
    },

    icon: {
      off: "rounded-full px-2 py-1",
    },
  },
  tabs: {
    tablist: {
      tabitem: {
        base: "flex items-center justify-center p-4 text-sm font-medium first:ml-0 disabled:cursor-not-allowed disabled:text-gray-400 disabled:dark:text-gray-500  rounded-t-lg border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300",
        // styles: {
        //   underline: {
        //     active: {
        //       on: "border-b-2 border-primary-400",
        //     },
        //   },
        // },
      },
    },
  },

  button: {
    color: {
      primary:
        "text-white bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800",
      secondary:
        "text-white bg-yellow-400  dark:bg-yellow-400 dark  focus:ring-yellow-200 dark:focus:ring-yellow-200 hover:bg-yellow-500",
      light:
        "group flex items-center justify-center p-0.5 text-center font-medium relative focus:z-10 focus:outline-none text-gray-900 bg-white border border-gray-300 enabled:hover:bg-gray-100 focus:ring-gray-300 dark:bg-transparent dark:text-white dark:border-gray-600 dark:enabled:hover:bg-gray-700 dark:enabled:hover:border-gray-700 dark:focus:ring-gray-700 rounded-lg focus:ring-2",
    },
    outline: {
      color: {
        primary:
          "text-primary-500 bg-transparent dark:bg-transparent border border-primary-500 focus:ring-primary-300  dark:focus:ring-primary-300 hover:bg-transparent hover:ring-2 hover:ring-primary-400 dark:hover:text-gray-50",
        secondary:
          "text-yellow-400 bg-transparent dark:bg-transparent border  border-yellow-400 focus:ring-yellow-200 dark:focus:ring-yellow-200 hover:bg-transparent hover:ring-2 hover:ring-yellow-300",
      },
      on: "transition-all duration-75 ease-in group-hover:bg-opacity-0 group-hover:text-inherit",
    },
    size: {
      xs: "text-xs px-2 py-1",
      sm: "text-sm px-3 py-1.5",
      md: "text-sm px-3 py-2",
      lg: "text-base px-5 py-2.5",
      xl: "text-base px-6 py-3",
    },
  },
  dropdown: {
    floating: {
      base: "z-10 w-fit rounded-xl divide-y divide-gray-100 shadow",
      content: "rounded-xl text-sm text-gray-700 dark:text-gray-200",
      target: "w-fit dark:text-white",
      item: {
        base: "flex items-center justify-start py-2 px-4 text-sm text-gray-700 cursor-pointer w-full hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 focus:outline-none dark:hover:text-white dark:focus:bg-gray-600 dark:focus:text-white",
      },
    },
    content: "",
  },
  modal: {
    content: {
      inner: "relative rounded-lg bg-white shadow dark:bg-gray-800",
    },
    header: {
      base: "flex items-start justify-between rounded-t px-5 pt-5",
    },
  },
  navbar: {
    root: {
      base: "fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700",
    },
  },
  sidebar: {
    root: {
      base: "flex fixed top-0 left-0 z-20 flex-col flex-shrink-0 pt-16 h-full duration-75 border-r border-gray-200 lg:flex transition-width dark:border-gray-700 bg-white dark:bg-gray-800",
      inner:
        "h-full overflow-y-auto overflow-x-hidden rounded bg-white py-4 px-3 dark:bg-gray-800 small-scroll",
    },
  },
  textarea: {
    base: "block w-full text-sm p-4 rounded-lg border disabled:cursor-not-allowed disabled:opacity-50",
  },
  toggleSwitch: {
    toggle: {
      checked: {
        off: "!border-gray-200 !bg-gray-200 dark:!border-gray-600 dark:!bg-gray-700",
      },
    },
  },
  card: {
    "root": {
      "base": "flex rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800",
      "children": "flex h-full flex-col justify-center gap-4",
      "horizontal": {
        "off": "flex-col",
        "on": "flex-col md:max-w-xl md:flex-row"
      },
      "href": "hover:bg-gray-100 dark:hover:bg-gray-700"
    },
    "img": {
      "base": "",
      "horizontal": {
        "off": "rounded-t-lg",
        "on": "h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
      }
    }
  }

  // datepicker: {
  //   popup: {
  //     root: {
  //       base: "absolute top-10 block pt-2 z-50",
  //       inline: "relative top-0 z-auto",
  //       inner: " rounded-lg bg-white p-4  dark:bg-gray-700",
  //     },
  //   },
  // },
};
export default flowbiteTheme;
