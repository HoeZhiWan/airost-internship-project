import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userSignOut, getProfileInfo, updateProfilePicture } from '../../lib/action';
import LoadingScreen from '../../components/LoadingScreen';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { user, userStatus } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const idToken = await user.getIdToken();
        const result = await getProfileInfo(idToken);
        if (result.success) {
          setProfile(result.profile);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await userSignOut();
    navigate('/login');
  };

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB');
      return;
    }

    const idToken = await user.getIdToken();
    const result = await updateProfilePicture(idToken, file);
    
    if (result.success) {
      setProfile(prev => ({
        ...prev,
        profilePictureUrl: result.profilePictureUrl 
      }));
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Page</h1>
      
      {profile ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={profile.profilePictureUrl || "src/assets/Default_pfp.svg"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePictureUpload}
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{profile.firstName} {profile.lastName}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{profile.areaCode} {profile.phoneNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No profile information available.</p>
      )}

      <button 
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" 
        onClick={handleSignOut}
      >
        Sign Out
      </button>

    </div>
  );
};

export default ProfilePage;
