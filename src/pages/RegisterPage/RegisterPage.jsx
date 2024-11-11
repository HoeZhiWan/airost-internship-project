import { registerUser } from "../../../lib/action";
import {useActionS}

function RegisterPage() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-shade-500">
      <div className="w-[380px] h-fit p-[30px] bg-shade-400 rounded-[10px]">
        <div className="text-[32px] font-bold text-primary-tint-300">Register</div>
        <form onSubmit={registerUser} className="mx-3 text-text text-[16px]">
          <div className="flex flex-col">
              <label className="mt-[24px] font-bold">Email</label>
              <input id="email" name="email" type="email" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] h-[30px] bg-shade-300 placeholder-text italic rounded-[5px] focus:ring-0" placeholder="example@domain.com" />
          </div>
          <div className="flex flex-col">
              <label className="mt-[24px] font-bold">Password</label>
              <input id="password" name="password" type="password" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] h-[30px] bg-shade-300 placeholder-text italic rounded-[5px] focus:ring-0" placeholder="Must have at least 8 characters" />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col">
                <label className="mt-[24px] font-bold">Re-enter Password</label>
                <input type="password" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] h-[30px] bg-shade-300 placeholder-text italic rounded-[5px] focus:ring-0" placeholder="Re-enter Password" />
            </div>
            <a className="self-end d-block mt-[4px] text-[12px] italic" href="">Have an account? Click here!</a>
          </div>

          <button href="#" className="flex justify-center gap-[4px] mt-[24px] w-full h-fit py-[8px] bg-primary-tint-300 text-white rounded-[5px] fs-6 duration-200">
            <span>Register</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
            </svg>
          </button>
          
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
