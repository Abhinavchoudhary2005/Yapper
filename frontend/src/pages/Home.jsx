import React, { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ReceiverUser from "../components/ReceiverUser";

const Home = () => {
  const { checkAuth, onlineUsers } = useAuthStore();
  const { receiverUser, getUsers, users, setreceiverUser, getMessages } =
    useChatStore();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const verifyAuthAndFetchUsers = async () => {
      await checkAuth();
      const authUser = await useAuthStore.getState().authUser;
      if (!authUser) {
        await navigate("/login");
      } else {
        setLoadingUsers(true);
        await getUsers();
        setLoadingUsers(false);
      }
    };
    verifyAuthAndFetchUsers();
  }, [checkAuth, getUsers, navigate]);

  const handleUserCardClick = (user) => {
    setreceiverUser(user);
    getMessages(user._id);
  };

  return (
    useAuthStore.getState().authUser && (
      <div className="flex" style={{ height: "calc(100vh - 4rem)" }}>
        {/* Sidebar */}
        <div className="fixed top-5 ml-3.5 z-0">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center dark:bg-primary/20">
            <MessageSquare className="w-5 h-5 text-primary dark:text-primary-light" />
          </div>
        </div>

        <div
          className={`${
            sidebarExpanded ? "w-60" : "w-16"
          } fixed top-16 bottom-0 bg-base-200 p-2 shadow-md transition-transform duration-300 ease-in-out lg:static lg:block lg:w-1/5 z-40`}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          {/* User List */}
          <div className="space-y-2 h-full overflow-y-auto">
            {loadingUsers ? (
              <div className="flex justify-center items-center h-full">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : users && users.length > 0 ? (
              users.map((user) => {
                const isOnline = onlineUsers?.includes(user._id);
                return (
                  <div
                    key={user._id}
                    className="flex items-center gap-4 p-1 cursor-pointer hover:bg-base-300 rounded-lg"
                    onClick={() => handleUserCardClick(user)}
                  >
                    {/* Profile Picture or Initials */}
                    <div className="relative avatar">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content text-lg">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt={user.fullName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="flex justify-center items-center h-full w-full">
                            {user.fullName
                              .split(" ")
                              .map((word) => word[0].toUpperCase())
                              .join("")}
                          </div>
                        )}
                      </div>

                      {/* Online Status Dot */}
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2"></div>
                      )}
                    </div>

                    {/* User Name and Online Status */}
                    <div
                      className={`flex flex-col ${
                        sidebarExpanded
                          ? "opacity-100"
                          : "opacity-0 lg:opacity-100"
                      }`}
                    >
                      <span className="text-base-content">{user.fullName}</span>
                      <span className="text-xs text-gray-500">
                        {isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-base-content/70">No users found</p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 bg-base-100 relative transition-transform duration-200 ease-in-out ml-16 lg:ml-0`}
          style={{ width: "calc(100vw - 4rem)" }}
        >
          {receiverUser && useAuthStore.getState().authUser ? (
            <ReceiverUser user={receiverUser} />
          ) : (
            <div className="flex flex-col items-center justify-center px-4 h-full">
              <h1 className="text-3xl font-bold text-base-content text-center max-w-xs mx-auto">
                Welcome to Yapper!
              </h1>
              <p className="text-base-content/70 mt-4 text-center max-w-xs mx-auto">
                Select a user to start chatting.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default Home;
