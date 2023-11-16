import HeaderIcon from "@assets/images/library-icon.svg";
import { Link } from "react-router-dom";
import { AiFillCalendar, AiOutlineSearch } from "react-icons/ai";

import { SiBookstack } from "react-icons/si";
import { RiFileList2Fill } from "react-icons/ri";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "@definitions/configs/msal/msal.config";
import IsAuth from "@components/auth/IsAuth";
import ProfileDropdown from "@components/ProfileDropdown";
import { useEffect } from "react";
import { toast } from "react-toastify";
const Homepage = () => {
  const { instance } = useMsal();
  const signIn = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const flash = sessionStorage.getItem("flash");
    sessionStorage.removeItem("flash");
    if (!flash) return;
    const flashBody = JSON.parse(flash);
    const expiry = new Date(flashBody?.expiredAt);
    const now = new Date();
    if (expiry < now) return;
    toast.error(flashBody?.message, { delay: 1000 });
  }, []);
  return (
    <>
      <header className="h-16 border-b w-100 flex justify-between font-INTER">
        <img
          src={HeaderIcon}
          alt="library-logo"
          className="w-12 lg:w-14 ml-3"
        ></img>
        <nav className="h-full justify-self-end hidden md:block">
          <ul className="list-none flex gap-2 h-full items-center ">
            {/* <li>
              <Link to="/catalog" className="font-light text-sm">
                Home
              </Link>
            </li>
            <li>
              <Link to="/" className="font-light text-sm">
                Library Policy
              </Link>
            </li> */}
          </ul>
        </nav>
        <div className="flex items-center  ml-2 gap-2">
          <IsAuth>
            <div className="mr-5">
              <ProfileDropdown></ProfileDropdown>
            </div>
          </IsAuth>
        </div>
      </header>

      <div className="hero min-h-screen bg-hero-img">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-xl">
            <h1 className="mb-5 text-5xl font-bold text-base-100">
              Welcome to <br></br>STI College Munoz Edsa Library!
            </h1>
            <p className="mb-5 text-base-100">
              Discover a wealth of knowledge and resources to support your
              academic and personal interests. Our expert librarians are here to
              help you find what you need, whether it's a classic book or
              cutting-edge research. Join us on a journey of lifelong learning
              and exploration.
            </p>
            <div className="flex justify-center gap-2">
              <IsAuth
                fallback={
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      signIn();
                    }}
                  >
                    Sign In
                  </button>
                }
              >
                <Link className="btn btn-primary" to="/catalog">
                  Browse Catalog
                </Link>
              </IsAuth>
            </div>
          </div>
        </div>
      </div>

      <div className="cards w-full mt-44 md:mt-32">
        <h2 className="text-center text-4xl font-semibold p-1 md:w-8/12 md:mx-auto">
          Discover Everything Your Library Has to Offer
        </h2>
        <p className="text-center text-base md:text-lg text-light  text-gray-700 p-3  md:w-8/12 md:mx-auto lg:w-full">
          Your exclusive access to a world of knowledge: Make the most of it!
          Unlock the power of learning with our online library
        </p>
        <div className="w-full items-center flex flex-col gap-16  mt-10 lg:flex-row md:justify-center md:gap-28">
          <div className="drop-shadow-sm border w-96 h-96  border-gray-100 p-5 rounded  flex justify-center items-center flex-col">
            <section className="mb-7">
              <div className="rounded-full bg-secondary p-5  flex justify-center hover:">
                <SiBookstack
                  className="text-primary"
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
          <div className="drop-shadow-sm border w-96 h-96  border-gray-100 p-5 rounded  flex justify-center items-center flex-col">
            <section className="mb-7">
              <div className="rounded-full bg-secondary p-5  flex justify-center">
                <RiFileList2Fill
                  className="text-primary"
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
          <div className="drop-shadow-sm border w-96 h-96  border-gray-100 p-5 rounded  flex justify-center items-center flex-col">
            <section className="mb-7">
              <div className="rounded-full bg-secondary p-5  flex justify-center">
                <AiFillCalendar
                  className="text-primary"
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
      <footer className="mt-52 h-52 border-t bg-primary">
        {/* <div className="grid grid-cols-2 justify-around w-9/12 mx-auto">
          <section>
            <h3>General</h3>
            FOOOTER WALA PANG LAMAN SUSNOD NA TOOO
          </section>
          <section>Hello</section>
        </div> */}
      </footer>
    </>
  );
};

export default Homepage;
