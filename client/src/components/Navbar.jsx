import React, { useState } from "react";
import { motion } from "framer-motion";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
// import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function Navbar() {
  const { user, logout } = useAuth();
  const [showcreditpopup, setShowcreditpopup] = useState(false);
  const [showuserpopup, setShowuserpopup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const getAvatarColor = (name) => {
    const colors = [
      "bg-red-100 text-red-600 border-red-300",
      "bg-blue-100 text-blue-600 border-blue-300",
      "bg-green-100 text-green-600 border-green-300",
      "bg-purple-100 text-purple-600 border-purple-300",
      "bg-yellow-100 text-yellow-600 border-yellow-300",
      "bg-pink-100 text-pink-600 border-pink-300",
      "bg-indigo-100 text-indigo-600 border-indigo-300",
      "bg-orange-100 text-orange-600 border-orange-300",
    ];

    if (!name) {
      return colors[0];
    }

    let total = 0;

    for (let i = 0; i < name.length; i++) {
      total += name.charCodeAt(i);
    }

    return colors[total % colors.length];
  };

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border
        border-gray-200 px-8 py-1 flex justify-between items-center relative"
      >
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h1 className="font-semibold hidden md:block text-lg">
            {/* InterviewIQ.AI */}
            {user?.name}
          </h1>
        </div>

        <div className="flex items-center gap-6 relative">
          {/* Credits Button */}
          <div className="relative">
            <button
              className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition cursor-pointer"
              onClick={() => {
                if (!user) {
                  setShowAuth(true);
                  return;
                }
                setShowcreditpopup(!showcreditpopup);
                setShowuserpopup(false);
              }}
            >
              <BsCoin size={20} />
              {user?.credits || 0}
            </button>
            {showcreditpopup && (
              <div className="absolute right-12.5 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-lg p-5 z-50 ">
                <p className="text-sm text-gray-600 mb-4">
                  Need more credits to continue interviews?
                </p>

                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-black text-white py-2 rounded-lg text-sm cursor-pointer"
                >
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          {/* Profile Image */}
          <div className="relative z-50">
            <button
              className="flex cursor-pointer items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-md hover:bg-gray-200 transition"
              onClick={() => {
                if (!user) {
                  setShowAuth(true);
                  return;
                }

                setShowuserpopup(!showuserpopup);
                setShowcreditpopup(false);
              }}
            >
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getAvatarColor(
                    user?.name,
                  )}`}
                >
                  <span className="text-xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </button>

            {showuserpopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">
                <p className="text-md text-blue-500 font-medium mb-1">
                  {user?.name}
                </p>

                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-sm py-2 text-gray-600 hover:text-black"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 cursor-pointer"
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Navbar;
