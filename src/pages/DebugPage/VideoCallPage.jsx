import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    StreamCall, 
    StreamVideo, 
    StreamVideoClient,
    useCallStateHooks,
    CallingState,
    StreamTheme,
    SpeakerLayout,
    CallControls
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import './videoCall.css';  // Add this import
import { useProfiles } from '../../contexts/ProfileContext';
import LoadingScreen from '../../components/LoadingScreen';
import { customTheme } from './videoTheme';

const apiKey = import.meta.env.VITE_STREAMIO_API_KEY;

function VideoCallPage() {
    const navigate = useNavigate();

    const [client, setClient] = useState(null);
    const [call, setCall] = useState(null);
    const [token, setToken] = useState(null);
    const [streamUserId, setStreamUserId] = useState(null);

    const { user } = useAuth();
    const { getProfile } = useProfiles();
    const { callId: urlCallId } = useParams();

    useEffect(() => {
        // Generate random call ID if none provided
        if (!urlCallId) {
            const randomId = Math.random().toString(36).substring(2, 15);
            navigate(`/video-call/${randomId}`, { replace: true });
            return;
        }

        const getToken = async () => {
            try {
                const idToken = await user.getIdToken();
                const response = await fetch('http://localhost:3000/api/video/generate-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    }
                });
                const data = await response.json();
                setToken(data.token);
                setStreamUserId(data.userId);
            } catch (error) {
                console.error('Error getting token:', error);
            }
        };

        if (user) {
            getToken();
        }
    }, [urlCallId, navigate, user]);

    useEffect(() => {
        const initClient = async () => {
            if (!token || !streamUserId) return;
            
            const idToken = await user.getIdToken();
            const profile = await getProfile(streamUserId, idToken);
            
            const streamClient = new StreamVideoClient({
                apiKey,
                user: { 
                    id: streamUserId,
                    name: profile?.username || user.displayName || streamUserId,
                    image: profile?.profilePicture || 'src/assets/Default_pfp.svg' // Change profilePictureUrl to image
                },
                token,
            });

            setClient(streamClient);

            const newCall = streamClient.call('default', urlCallId);
            await newCall.join({ 
                create: true,
                settings: {
                    recording: false,
                }
            });
            setCall(newCall);
        };

        if (urlCallId) { 
            initClient();
        }

        return () => {
            if (client) {
                client.disconnectUser();
            }
        };
    }, [token, streamUserId, urlCallId]);

    if (!client || !call) {
        return <LoadingScreen />;
    }

    return (
        <StreamVideo client={client}>
            <StreamCall call={call}>
                <CallUI />
            </StreamCall>
        </StreamVideo>
    );
}

function CallUI() {
    const { 
        useParticipants,
        useParticipantCount,
        useCallCallingState,
        useLocalParticipant,
        useRemoteParticipants 
    } = useCallStateHooks();

    const callingState = useCallCallingState();
    const localParticipant = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const participants = useParticipants(); 
    const participantCount = useParticipantCount();
    
    const { getProfile } = useProfiles();
    const { user } = useAuth();

    const [profiles, setProfiles] = useState({});
    
    useEffect(() => {
        const loadProfiles = async () => {
            try {
                const idToken = await user.getIdToken();
                const profileData = {};
                for (const participant of participants) {
                    const profile = await getProfile(participant.userId, idToken);
                    profileData[participant.userId] = profile || {
                        username: participant.name || participant.userId,
                        profilePicture: 'src/assets/Default_pfp.svg'
                    };
                }
                setProfiles(profileData);
            } catch (error) {
                console.error('Error loading profiles:', error);
            }
        };
        
        if (user && participants.length > 0) {
            loadProfiles();
        }
    }, [participants, user]);

    if (callingState !== CallingState.JOINED) {
        return <LoadingScreen />;
    }

    return (
        <StreamTheme theme={customTheme}>
            <div className="video-call-container fixed inset-0 bg-gray-900">
                <SpeakerLayout 
                    participantsBarPosition='bottom'
                    ParticipantViewUI={(props) => (
                        <div className="relative">
                            <ParticipantView {...props} />
                            <div className="absolute bottom-2 left-2 flex items-center bg-black/50 px-2 py-1 rounded">
                                <div className="w-6 h-6 rounded-full overflow-hidden">
                                    <img 
                                        src={props.participant.image || 'src/assets/Default_pfp.svg'} 
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="text-white text-sm ml-2">
                                    {props.participant.name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    )}
                />
                <CallControls className="fixed bottom-0 left-1/2 transform -translate-x-1/2" />
                
                <div className="fixed top-4 right-4 bg-gray-800/80 p-4 rounded-lg text-white z-50">
                    <div className="participant-count">
                        Participants in call: {participantCount}
                    </div>
                </div>
            </div>
        </StreamTheme>
    );
}

export default VideoCallPage;