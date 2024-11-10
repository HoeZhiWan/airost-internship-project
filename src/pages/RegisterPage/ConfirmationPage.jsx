function ConfirmationPage() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-shade-500">
    <div className="w-fit h-fit p-[30px] bg-shade-400 rounded-[10px]">
      
      <form className="mx-3 text-text text-[16px] text-center">
          <div className="text-[32px] font-bold text-primary-tint-300">Verify Your email</div>

          <div className="flex flex-col items-center">
            <div className="text-[16px] mt-8 max-w-[380px]">We sent an email to:</div>
            <div className="">[Email]</div>
          </div>

          <div className="mt-[32px] max-w-[480px]">Just click on the link in that email to complete your signup. If you don’t see it, you may need to check your spam folder.</div>
          
          <div className="mt-[32px] max-w-[480px]">Still can&apos;t find the email? No problem.</div>

        <button href="#" className="flex justify-center mt-8 w-full h-fit py-[8px] bg-primary-tint-300 text-white rounded-[5px] fs-6 duration-200">Resend Verification Email</button>
        
      </form>
    </div>
  </div>
  )
}

export default ConfirmationPage
