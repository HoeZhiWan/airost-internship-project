import { useState, useEffect } from "react";
import { auth } from "../../../firebase-client"
import { emailVerification } from "../../lib/action";
import { useNavigate } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import LoadingScreen from "../../components/LoadingScreen";

function ConfirmationPage() {
  const [user, loading] = useAuthState(auth);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  console.log('Component mounted');
  console.log('Auth state:', { user, loading });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user, redirecting to login');
        navigate('/login');
      } else if (user.emailVerified) {
        console.log('Email verified, redirecting to profile');
        navigate('/profile');
      }
    }
  }, [user, loading, navigate]);

  const handleVerifyEmail = async (event) => {
    event.preventDefault();
    if (!user) return;

    try {
      setIsSending(true);
      await emailVerification({ user });
      // Refresh the user to check if email is verified
      await user.reload();
    } catch(error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setIsSending(false);
    }
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-shade-500">
      <div className="w-fit h-fit p-[30px] bg-shade-400 rounded-[10px]">
        <form className="mx-3 text-text text-[16px] text-center">
          <div className="text-[32px] font-bold text-primary-tint-300">Verify Your Email</div>
          <div className="flex flex-col items-center">
            <div className="text-[16px] mt-8 max-w-[380px]">We sent an email to:</div>
            <div>{user.email}</div>
          </div>
          <div className="mt-[32px] max-w-[480px]">Just click on the link in that email to complete your signup. If you don&apos;t see it, you may need to check your spam folder.</div>
          <div className="mt-[32px] max-w-[480px]">Still can&apos;t find the email? No problem.</div>
          <button 
          onClick={handleVerifyEmail} 
          disabled={isSending}
          className={`
            flex justify-center mt-8 w-full h-fit py-[8px] bg-primary-tint-300 text-white rounded-[5px] fs-6 duration-200
            ${isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-tint-400'}
          `}
          >
            {isSending ? (
              <>
                <span className="animate-spin">⌛</span>
                Sending...
              </> ) : ( "Resend Verification Email" )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConfirmationPage;
