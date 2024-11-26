import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { userSignOut, getProfileInfo } from '../../lib/action';
import LoadingScreen from '../../components/LoadingScreen';

const ProfilePage = () => {
  const { user, userStatus } = useOutletContext();
  const navigate = useNavigate();
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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profile Page</h1>
      
      {profile ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
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
