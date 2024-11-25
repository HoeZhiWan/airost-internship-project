import { useNavigate, useSearchParams } from 'react-router-dom'; 
import { useEffect, useState } from 'react';
import { userResetPassword } from '../../lib/action';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams(); 
  const navigate = useNavigate(); 
  const resetCode = searchParams.get('resetCode'); 
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(''); 
  const [loading, setLoading] = useState(false);
  
  useEffect(() => { 
    if (!resetCode) { 
      navigate('/forgetpassword', { replace: true });  
    } 
  }, [resetCode, navigate]);

  const handleSubmit = async (event) => { 
    event.preventDefault(); 

    setLoading(true);

    try {
      const formData = new FormData(event.target);
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');
  
      const result = await userResetPassword(resetCode, password, confirmPassword); 
      setMessage(result.message);
      
      if (result.success) {
        navigate('/login', { replace: true });  
      } else if (result.errors) {
        setErrors(result.errors);
      }

    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-shade-500">
      <div className="w-fit h-fit p-[30px] bg-shade-400 rounded-[10px]">
        
        <form onSubmit={handleSubmit} className="mx-3 text-text text-[16px]">
            <div className="text-[32px] font-bold text-primary-tint-300">Reset your password</div>
            <div className="text-[16px] mt-8 max-w-[380px]">Verify successful! You can rest your password!</div>

          <div className="flex flex-col">
              <label className="mt-8 font-bold">Password</label>
              <input id="password" name="password" type="password" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] h-[30px] bg-shade-300 placeholder-text italic rounded-[5px] focus:ring-0" placeholder="Must have at least 8 characters" />
          </div>

          { errors.password && 
            errors.password.map((error) => (
              <p className="error mt-[4px] text-[14px] text-error italic" key={error}>
                ** {error}
              </p> 
            ))
          }
            <div className="flex flex-col">
                <label className="mt-8 font-bold">Re-enter Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] h-[30px] bg-shade-300 placeholder-text italic rounded-[5px] focus:ring-0" placeholder="Re-enter Password" />
            </div>

          { errors.confirmPassword && 
            errors.confirmPassword.map((error) => (
              <p className="error mt-[4px] text-[14px] text-error italic" key={error}>
                ** {error}
              </p> 
            ))
          }

          <button disabled={loading} className="flex justify-center mt-8 w-full h-fit py-[8px] bg-primary-tint-300 text-white rounded-[5px] fs-6 duration-200">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
          
          {message && <p>{message}</p>}
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage;
