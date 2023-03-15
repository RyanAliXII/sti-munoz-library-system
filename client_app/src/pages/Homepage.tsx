import HeaderIcon from "@assets/images/library-icon.svg";
import { Link } from "react-router-dom";
import { AiFillCalendar, AiOutlineSearch } from "react-icons/ai";

import { SiBookstack } from "react-icons/si";
import { RiFileList2Fill } from "react-icons/ri";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@definitions/configs/msal/msal.config";
import IsAuth from "@components/auth/IsAuth";
import ProfileDropdown from "@components/ProfileDropdown";
const Homepage = () => {
  const { instance } = useMsal();
  const signIn = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <header className="h-16 border-b w-100 flex justify-around font-INTER">
        <img src={HeaderIcon} alt="library-logo" className="w-14 ml-2"></img>
        <nav className="h-full justify-self-end">
          <ul className="list-none flex gap-2 h-full items-center ">
            <li>
              <Link to="/catalog" className="font-light text-sm">
                Home
              </Link>
            </li>
            <li>
              <Link to="/" className="font-light text-sm">
                Library Policy
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center ml-2 gap-2">
          {/* <Link
            to="/catalog"
            className="px-5 py-2 text-blue-500 text-sm hover:border-yellow-400 hover:text-yellow-400"
          >
            Catalog
          </Link> */}
          <IsAuth
            fallback={
              <button
                className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-yellow-400 text-sm"
                onClick={() => {
                  signIn();
                }}
              >
                Sign In
              </button>
            }
          >
            <ProfileDropdown></ProfileDropdown>
          </IsAuth>
        </div>
      </header>
      <div className="hero flex justify-center mt-32 w-full">
        <section className="basis-4/12 flex justify-center flex-col gap-2 ml-20">
          <h1 className="text-4xl font-semibold text-yellow-300">
            Welcome to STI College Munoz Edsa Library!
          </h1>
          <p className="w-9/12 text-gray-600 font-light mt-2">
            Discover a wealth of knowledge and resources to support your
            academic and personal interests. Our expert librarians are here to
            help you find what you need, whether it's a classic book or
            cutting-edge research. Join us on a journey of lifelong learning and
            exploration.
          </p>
          <div className="mt-2 flex gap-2">
            <Link
              to="/catalog"
              className="px-5 py-3 rounded text-white bg-blue-500  hover:bg-yellow-300 text-sm"
            >
              <span className="inline">Browse catalog</span>

              <AiOutlineSearch className="ml-1 inline text-sm" />
            </Link>
            <Link
              to="/"
              className="px-5 py-3 rounded text-blue-500 border border-blue-500  text-sm hover:border-yellow-300 hover:text-yellow-300 "
            >
              Borrow Book
            </Link>
          </div>
        </section>
        <div
          className="bg-hero-img  h-96 bg-no-repeat basis-4/12"
          style={{ backgroundSize: "100% 100%" }}
        ></div>
      </div>
      <div className="cards w-full mt-80">
        <h2 className="text-center text-4xl font-semibold text-yellow-300">
          Discover Everything Your Library Has to Offer
        </h2>
        <p className="text-center text-lg text-light mt-2 text-gray-700">
          Your exclusive access to a world of knowledge: Make the most of it!
          Unlock the power of learning with our online library
        </p>
        <div className="w-full flex h-96 mt-20 justify-center gap-28">
          <div className="drop-shadow-sm border border-gray-100 rounded basis-96 flex justify-center items-center flex-col">
            <section className="mb-7">
              <div className="rounded-full bg-yellow-300 p-5  flex justify-center hover:">
                <SiBookstack
                  className="text-blue-600"
                  style={{ fontSize: "60px" }}
                />
              </div>
            </section>
            <section>
              <h3 className="text-gray-600 text-2xl text-center">
                Borrow Books
              </h3>
              <p className="text-gray-500 text-center font-light w-10/12 mt-1 mx-auto">
                Never miss a read: Reserve books online and get notified when
                they're available
              </p>
            </section>
          </div>
          <div className="drop-shadow-sm border border-gray-100 rounded basis-96 flex justify-center items-center flex-col">
            <section className="mb-7">
              <div className="rounded-full bg-yellow-300 p-5  flex justify-center">
                <RiFileList2Fill
                  className="text-blue-600"
                  style={{ fontSize: "60px" }}
                />
              </div>
            </section>
            <section>
              <h3 className="text-gray-600 text-2xl text-center">Catalog</h3>
              <p className="text-gray-500 text-center font-light w-10/12 mt-1 mx-auto">
                Discover a new favorite: Browse, borrow, and reserve books
                online.
              </p>
            </section>
          </div>
          <div className="drop-shadow-sm border border-gray-100 rounded basis-96 flex justify-center items-center flex-col">
            <section className="mb-7">
              <div className="rounded-full bg-yellow-300 p-5  flex justify-center">
                <AiFillCalendar
                  className="text-blue-600"
                  style={{ fontSize: "60px" }}
                />
              </div>
            </section>
            <section>
              <h3 className="text-gray-700 text-2xl text-center">
                Reserve rooms
              </h3>
              <p className="text-gray-600 text-center font-light w-10/12 mt-1 mx-auto">
                Get comfortable and get gaming: Reserve your spot in our cozy
                and gaming rooms
              </p>
            </section>
          </div>
        </div>
      </div>
      <footer className="mt-52 h-52  border w-full">
        <div className="grid grid-cols-2 justify-around w-9/12 mx-auto">
          <section>
            <h3>General</h3>
            FOOOTER WALA PANG LAMAN SUSNOD NA TOOO
          </section>
          <section>Hello</section>
        </div>
      </footer>
    </>
  );
};

export default Homepage;
