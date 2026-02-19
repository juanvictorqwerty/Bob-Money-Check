import AccountView from "@/components/accountView"

const Account=()=>{
    return(
        //default is mobile then sm:is bigger screens median screens then large screens
        <div className="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[50%] flex items-center justify-center mx-auto">
            <AccountView/>
        </div>
    )
}
export default Account