import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase-client';
import { userSignOut } from '../../lib/action';

function HomePage() {
    const [user, loading] = useAuthState(auth);

    const handleSignOut = async () => {
        await userSignOut();
    };

    return (
        <>
            <h1>ALTO</h1>
            { user ? 
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleSignOut}>Sign Out</button> 
            : null }
        </>
    )
}

export default HomePage;