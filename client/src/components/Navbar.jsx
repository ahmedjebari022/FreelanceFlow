import { useContext, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Your order has been completed",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      text: "New message from client",
      time: "Yesterday",
      read: true,
    },
  ]);

  // Track scroll position to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close notifications when opening mobile menu
    if (!mobileMenuOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    // Close mobile menu when opening notifications
    if (!notificationsOpen) setMobileMenuOpen(false);
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  // Check if there are unread notifications
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        isScrolled ? "bg-base-100 shadow-md" : "bg-transparent"
      }`}
    >
      <div className="navbar container mx-auto px-4 py-2">
        {/* Logo/Brand */}
        <div className="navbar-start">
          <Link to="/" className="flex items-center">
            <div className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-content relative">
                  <span
                    className="text-xl font-bold absolute"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      paddingBottom: "1px", // Optical adjustment
                    }}
                  >
                    FF
                  </span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold">FreelanceFlow</h1>
                <p className="text-xs -mt-1 text-base-content/70">
                  Connect with top talent
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Center navigation - only on desktop */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li>
              <Link
                to="/"
                className={
                  location.pathname === "/"
                    ? "active font-medium"
                    : "font-medium"
                }
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/categories"
                className={
                  location.pathname === "/categories"
                    ? "active font-medium"
                    : "font-medium"
                }
              >
                Categories
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                className={
                  location.pathname === "/services"
                    ? "active font-medium"
                    : "font-medium"
                }
              >
                Services
              </Link>
            </li>
            {user && user.role === "freelancer" && (
              <li>
                <Link
                  to="/my-services"
                  className={
                    location.pathname === "/my-services"
                      ? "active font-medium"
                      : "font-medium"
                  }
                >
                  My Services
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/about"
                className={
                  location.pathname === "/about"
                    ? "active font-medium"
                    : "font-medium"
                }
              >
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Right side - user actions */}
        <div className="navbar-end">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  onClick={toggleNotifications}
                  className="btn btn-ghost btn-circle"
                >
                  <div className="indicator">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {hasUnread && (
                      <span className="badge badge-primary badge-xs indicator-item"></span>
                    )}
                  </div>
                </div>
                {notificationsOpen && (
                  <div
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-80"
                  >
                    <div className="flex justify-between items-center p-2 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b hover:bg-base-200 ${
                              !notification.read ? "bg-base-200" : ""
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <p className="text-sm">{notification.text}</p>
                              {!notification.read && (
                                <span className="badge badge-primary badge-xs"></span>
                              )}
                            </div>
                            <p className="text-xs text-base-content/60 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-base-content/70">
                          No notifications
                        </div>
                      )}
                    </div>
                    <div className="p-2 border-t mt-2">
                      <Link
                        to="/notifications"
                        className="btn btn-ghost btn-xs btn-block"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders button */}
              <Link to="/orders" className="btn btn-ghost btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </Link>

              {/* User menu */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="w-10 rounded-full">
                    <img
                      alt="User avatar"
                      src={
                        user.profileImage ||
                        `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`
                      }
                    />
                  </div>
                </div>
                <ul
                  tabIndex={0}
                  className="menu dropdown-content z-[1] p-2 shadow-lg bg-base-100 rounded-box w-52 mt-4"
                >
                  <li className="menu-title px-4 py-2">
                    <div className="font-medium">
                      {user.firstName} {user.lastName}
                      <div className="badge badge-primary badge-sm ml-2">
                        {user.role}
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link to="/profile" className="text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </Link>
                  </li>
                  {user.role === "freelancer" && (
                    <>
                      <li>
                        <Link to="/my-services" className="text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          My Services
                        </Link>
                      </li>
                      <li>
                        <Link to="/earnings" className="text-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Earnings
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link to="/orders" className="text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Orders
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <li>
                      <Link to="/admin" className="text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <div className="divider my-1"></div>
                  <li>
                    <button onClick={logout} className="text-sm text-error">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu button - only on small screens */}
          <button
            className="btn btn-ghost lg:hidden ml-2"
            onClick={toggleMobileMenu}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16m-7 6h7"
                }
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu - slide down when open */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="menu menu-sm dropdown-content p-4 z-[1] bg-base-100 w-full shadow-xl">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/categories"
              className={location.pathname === "/categories" ? "active" : ""}
            >
              Categories
            </Link>
          </li>
          <li>
            <Link
              to="/services"
              className={location.pathname === "/services" ? "active" : ""}
            >
              Services
            </Link>
          </li>
          {user && user.role === "freelancer" && (
            <li>
              <Link
                to="/my-services"
                className={location.pathname === "/my-services" ? "active" : ""}
              >
                My Services
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/about"
              className={location.pathname === "/about" ? "active" : ""}
            >
              About
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link to="/profile">Profile</Link>
              </li>
              <li>
                <Link to="/orders">Orders</Link>
              </li>
              {user.role === "freelancer" && (
                <li>
                  <Link to="/earnings">Earnings</Link>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
