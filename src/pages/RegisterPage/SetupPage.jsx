import areaCodes from "../../assets/CountryCodes.json"

function SetupPage() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-shade-500">
      <div className="w-[380px] h-fit p-[30px] bg-shade-400 rounded-[10px]">
        
        <form className="mx-3 text-text text-[16px]">
            <div className="text-[32px] font-bold text-primary-tint-300">Register Success!</div>
            <div className="">Before you can start using the app, you need to enter some details.</div>

          <div className="flex flex-col">
              <label className="mt-[32px] font-bold">Username</label>
              <div className="flex">
                <div className="flex flex-col me-[10px] basis-1/2">
                    <input id="fname" name="fname" type="text" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] w-full h-[30px] bg-shade-300 placeholder-text placeholder:italic rounded-[5px] focus:ring-0" placeholder="John" />
                    <div className="text-[12px] mt-[2px]">First name</div>
                </div>

                <div className="flex flex-col basis-1/2">
                    <input id="lname" name="lname" type="text" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] w-full h-[30px] bg-shade-300 placeholder-text placeholder:italic rounded-[5px] focus:ring-0" placeholder="Doe" />
                    <div className="self-end text-[12px] mt-[2px]">Last name</div>
                </div>
              </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col">
                <label className="mt-[32px] font-bold">Phone Number</label>
                <div className="flex">
                <div className="flex flex-col me-[10px] basis-1/3">
                    <select id="areaCode" className="flex items-center text-[12px] border-0 mt-[10px] p-0 px-[8px] w-full h-[30px] bg-shade-300 rounded-[5px] focus:ring-0">
                        <option value="Malaysia" selected>+60</option>
                        {areaCodes.map((areaCode, id) => (
                            <option value={areaCode.name} key={id}>{areaCode.dial_code}</option>
                        ))}
                    </select>
                    <div className="text-[12px] mt-[2px]">Area code</div>
                </div>

                <div className="flex flex-col w-full">
                    <input id="lname" name="lname" type="text" className="text-[12px] border-0 mt-[10px] px-[8px] py-[6px] w-full h-[30px] bg-shade-300 placeholder-text placeholder:italic rounded-[5px] focus:ring-0" placeholder="123456789" />
                    <div className="self-end text-[12px] mt-[2px]">Phone Number</div>
                </div>
              </div>
            </div>
          </div>

          <button href="#" className="flex justify-center mt-[32px] w-full h-fit py-[8px] bg-primary-tint-300 text-white rounded-[5px] fs-6 duration-200">Confirm</button>
          
        </form>
      </div>
    </div>
  )
}

export default SetupPage
