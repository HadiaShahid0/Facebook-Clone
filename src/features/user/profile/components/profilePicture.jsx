import { useRef, useState } from "react";
import { Camera } from "react-feather";

import { supabase } from "../../../../utils/supabase";
import { updateProfileService, uploadProfileImageService } from "../services/profileServices";
import { getAvatarUrl } from "../../../../services/profileImageServices";

const ProfilePicture = ({ user, isOwnProfile, onUpdateProfile }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!authUser) {
        throw new Error("User is not authenticated");
      }

      const publicUrl=await uploadProfileImageService(authUser.id, file)

      const updatedProfile = await updateProfileService(user.id, {
        profileImage: publicUrl,
      });

      onUpdateProfile(updatedProfile);
    } catch (error) {
      console.error("Error uploading profile image:", error);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  return (
    <div className="position-relative d-inline-block">
      <img
        src={user.profileImage || getAvatarUrl(user)}
        alt={user.username}
        width="150"
        height="150"
        className="rounded-circle border border-4 border-white object-fit-cover"
      />

      {isOwnProfile && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="d-none"
            onChange={handleChange}
          />

          <button
            type="button"
            className="btn btn-light rounded-circle shadow position-absolute bottom-0 end-0"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              />
            ) : (
              <Camera size={18} />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default ProfilePicture;
