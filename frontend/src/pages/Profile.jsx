import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Camera } from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
  const { checkAuth, authUser, updateProfile } = useAuthStore(); // Destructure `updateProfile`
  const navigate = useNavigate();
  const nameInputRef = useRef(null);

  const [name, setName] = useState(authUser?.fullName || "");
  const [email] = useState(authUser?.email || "");
  const [createdAt] = useState(() => {
    const date = authUser?.createdAt ? new Date(authUser.createdAt) : null;
    return date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";
  });
  const [profilePhoto, setProfilePhoto] = useState(
    authUser?.profilePic || null
  );
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      const authUser = useAuthStore.getState().authUser;
      if (!authUser) {
        navigate("/login");
      }
    };

    verifyAuth();
  }, [checkAuth, navigate]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB.");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error(
          "Unsupported file format. Please upload a JPG or PNG image."
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
        setProfilePhoto(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (isSaving) return;

    setIsSaving(true);

    updateProfile(name, profilePhoto, (success) => {
      if (success) {
        const updatedUser = useAuthStore.getState().authUser;

        // Update local states for the photo
        setPhotoPreview(null); // Reset the preview
        setProfilePhoto(updatedUser.profilePic); // Update to the latest profilePic
      }
      setIsSaving(false);
    });
  };

  const handleNameClick = () => {
    if (nameInputRef.current) {
      const length = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(length, length); // Set cursor at the end
      nameInputRef.current.focus();
    }
  };

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)] mt-20 lg:h-full lg:mt-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Profile</h1>

      <div className="flex flex-col items-center space-y-4">
        {/* Profile Photo */}
        <div className="relative avatar">
          <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
            {photoPreview || profilePhoto ? (
              <img
                src={photoPreview || profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-xl bg-gray-200 text-gray-500">
                <span>
                  {authUser?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "No Photo"}
                </span>
              </div>
            )}
          </div>

          {/* Camera Icon for Upload */}
          <label
            htmlFor="photo-upload"
            className="absolute bottom-0 right-2 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-primary-focus"
          >
            <Camera size={16} />
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* Account Information */}
        <div className="card w-full max-w-lg bg-base-100 mt-4">
          <div className="card-body">
            <h2 className="card-title">Account Information</h2>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                type="text"
                value={name}
                onClick={handleNameClick}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered"
                placeholder="Enter your name"
                ref={nameInputRef}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="input input-bordered input-disabled"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">User Since</span>
              </label>
              <input
                type="text"
                value={createdAt}
                disabled
                className="input input-bordered input-disabled"
              />
            </div>
            <button
              className="btn btn-primary mt-4"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
