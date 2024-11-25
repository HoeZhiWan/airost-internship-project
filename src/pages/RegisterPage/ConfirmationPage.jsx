import { useState, useEffect } from "react";
import { auth } from "../../../firebase-client"
import { emailVerification } from "../../lib/action";
import { useNavigate } from "react-router-dom";

function ConfirmationPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { 
    const unsubscribe = auth.onAuthStateChanged(user => { 
      if (user) { 
        setUser(user); 
      } else { 
        navigate('/login'); 
      } }); 
      return () => unsubscribe(); 
  }, [navigate]);

  const handleVerifyEmail = async (event) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      await emailVerification({ user });
    } catch(error) {
      throw new Error('Failed to send verifcation email. Please try logging in.');
    } finally {
      setIsLoading(false);
    }
  }

  return user ? (
    <div className="w-screen h-screen flex justify-center items-center bg-shade-500">
      <div className="w-fit h-fit p-[30px] bg-shade-400 rounded-[10px]">
        <form className="mx-3 text-text text-[16px] text-center">
          <div className="text-[32px] font-bold text-primary-tint-300">Verify Your Email</div>
          <div className="flex flex-col items-center">
            <div className="text-[16px] mt-8 max-w-[380px]">We sent an email to:</div>
            <div>{user.email}</div>
          </div>
          <div className="mt-[32px] max-w-[480px]">Just click on the link in that email to complete your signup. If you don’t see it, you may need to check your spam folder.</div>
          <div className="mt-[32px] max-w-[480px]">Still can't find the email? No problem.</div>
          <button 
          onClick={handleVerifyEmail} 
          disabled={isLoading}
          className={`
            flex justify-center mt-8 w-full h-fit py-[8px] bg-primary-tint-300 text-white rounded-[5px] fs-6 duration-200
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-tint-400'}
          `}
          >
            {isLoading ? "Sending..." : "Resend Verification Email"}
          </button>
        </form>
      </div>
    </div>
  ) : null;
}
  
export default ConfirmationPage;
