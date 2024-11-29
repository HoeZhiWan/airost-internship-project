import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfiles } from '../../contexts/ProfileContext';

function TodoField({todo, todoId, onDelete, onAssign, assignedTo, members}) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const { user } = useAuth();
  const { getProfile } = useProfiles();

  useEffect(() => {
    const fetchUserProfiles = async () => {
      if (!assignedTo || !user) return;
      
      const idToken = await user.getIdToken();
      const profiles = await Promise.all(
        assignedTo.map(async (uid) => {
          const profile = await getProfile(uid, idToken);
          return profile ? profile.username : uid;
        })
      );
      setAssignedUsers(profiles);
    };

    fetchUserProfiles();
  }, [assignedTo, user, getProfile]);

  return (
    <div className="relative flex justify-between w-full p-4 bg-shade-300 rounded-[8px] text-[16px]">
        <div className="flex flex-col gap-1">
            <div>{todo}</div>
            {assignedUsers.length > 0 && (
                <div className="text-sm text-gray-500">
                    Assigned to: {assignedUsers.join(", ")}
                </div>
            )}
        </div>
        <div className="relative flex gap-2">
            <button onClick={() => setShowAssignMenu(!showAssignMenu)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
                </svg>
            </button>
            <button onClick={() => onDelete(todoId)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EE4238" className="size-6">
                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                </svg>
            </button>
            {showAssignMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-shade-400 rounded-md shadow-lg p-2 z-10">
                    {members.map(member => (
                        <div 
                            key={member.uid} 
                            className="cursor-pointer p-2 hover:bg-shade-300 rounded-md flex justify-between items-center"
                            onClick={() => {
                                onAssign(todoId, member.uid);  
                                setShowAssignMenu(false);
                            }}
                        >
                            <span>{member.fullName}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  )
}

export default TodoField
