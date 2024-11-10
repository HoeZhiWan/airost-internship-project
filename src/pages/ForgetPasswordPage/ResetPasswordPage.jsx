function ResetPasswordPage() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-shade-500">
      <div className="w-fit h-fit p-[30px] bg-shade-400 rounded-[10px]">
        
        <form className="mx-3 text-text text-[16px]">
            <div className="text-[32px] font-bold text-primary-tint-300">Reset your password</div>
            <div className="text-[16px] mt-8 max-w-[380px]">Verify successful! You can rest your password!</div>

          <div className="flex flex-col">
              <label className="mt-8 font-bold">Password</label>
              <input id="password" name="password" type="password" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] h-[30px] bg-shade-300 placeholder-text italic rounded-[5px] focus:ring-0" placeholder="Must have at least 8 characters" />
          </div>

            <div className="flex flex-col">
                <label className="mt-8 font-bold">Re-enter Password</label>
                <input type="password" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] h-[30px] bg-shade-300 placeholder-text italic rounded-[5px] focus:ring-0" placeholder="Re-enter Password" />
            </div>

          <button href="#" className="flex justify-center mt-8 w-full h-fit py-[8px] bg-primary-tint-300 text-white rounded-[5px] fs-6 duration-200">Submit</button>
          
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage
