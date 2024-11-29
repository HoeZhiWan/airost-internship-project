import { useState } from "react";
import areaCodes from "../../assets/CountryCodes.json"
import { useNavigate } from "react-router-dom";
import { setupProfile } from "../../lib/action";
import { useAuth } from "../../contexts/AuthContext";

function SetupPage() {
  const { user, updateUserStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const fname = formData.get('fname');
    const lname = formData.get('lname');
    const areaCode = formData.get('areaCode');
    const phoneNo = formData.get('phoneNo');

    try {
      setIsLoading(true);

      const result = await setupProfile({user}, fname, lname, areaCode, phoneNo);
      if (result.success) {
        setMessage(result.message);
        // Update the userStatus in AuthContext
        await updateUserStatus();
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } else if (result.errors) {
        setErrors(result.errors)
      } else if (result.error) {
        setMessage(result.error.message)
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-shade-500">
      <div className="w-[400px] h-fit p-[30px] bg-shade-400 rounded-[10px]">

        <form onSubmit={handleSubmit} className="mx-3 text-text text-[16px]">
          <div className="text-[32px] font-bold text-primary-tint-300">Register Success!</div>
          <div className="">Before you can start using the app, you need to enter some details.</div>

          <div className="flex flex-col">
            <label className="mt-[32px] font-bold">Username</label>
            <div className="flex gap-[10px]">
              <div className="flex flex-col basis-1/2">
                <input
                  id="fname"
                  name="fname"
                  type="text"
                  className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] w-full h-[30px] bg-shade-300 placeholder-text placeholder:italic rounded-[5px] focus:ring-0"
                  placeholder="John"
                />
                <div className="text-[12px] mt-[2px]">First name</div>
                {errors.fname && errors.fname.map((error) => (
                  <p className="error mt-[4px] text-[14px] text-error italic" key={error}>
                    ** {error}
                  </p>
                ))}
              </div>

              <div className="flex flex-col basis-1/2">
                <input
                  id="lname"
                  name="lname"
                  type="text"
                  className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] w-full h-[30px] bg-shade-300 placeholder-text placeholder:italic rounded-[5px] focus:ring-0"
                  placeholder="Doe"
                />
                <div className="text-[12px] mt-[2px] text-right">Last name</div>
                {errors.lname && errors.lname.map((error) => (
                  <p className="error mt-[4px] text-[14px] text-error italic text-right" key={error}>
                    ** {error}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="mt-[32px] font-bold">Phone Number</label>
            <div className="flex gap-[10px]">
              <div className="flex flex-col basis-1/3">
                <select id="areaCode" name="areaCode" defaultValue="+60" className="flex items-center text-[12px] border-0 mt-[10px] p-0 px-[8px] w-full h-[30px] bg-shade-300 rounded-[5px] focus:ring-0">
                  {areaCodes
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((areaCode) => (
                      <option
                        value={areaCode.dial_code}
                        key={areaCode.code}
                      >
                        {areaCode.code} ({areaCode.dial_code})
                      </option>
                    ))}
                </select>
                <div className="text-[12px] mt-[2px]">Area code</div>
                {errors.areaCode && errors.areaCode.map((error) => (
                  <p className="error mt-[4px] text-[14px] text-error italic" key={error}>
                    ** {error}
                  </p>
                ))}
              </div>

              <div className="flex flex-col basis-3/4">
                <input
                  id="phoneNo"
                  name="phoneNo"
                  type="tel"
                  pattern="[0-9]*"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '');
                  }}
                  className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] w-full h-[30px] bg-shade-300 placeholder-text placeholder:italic rounded-[5px] focus:ring-0"
                  placeholder="123456789"
                />
                <div className="text-[12px] mt-[2px] text-right">Phone number</div>
                {errors.phoneNo && errors.phoneNo.map((error) => (
                  <p className="error mt-[4px] text-[14px] text-error italic text-right" key={error}>
                    ** {error}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <button
            disabled={isLoading}
            className={`
          flex justify-center mt-[32px] w-full h-fit py-[8px] bg-primary-tint-300 text-white rounded-[5px] fs-6 duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-tint-400'}
          `}>
            {isLoading ? "Submitting" : "Confirm"}
          </button>

          {message && <p>{message}</p>}
        </form>
      </div >
    </div >
  )
}

export default SetupPage;
