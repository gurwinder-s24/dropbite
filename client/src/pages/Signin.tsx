import axios from "axios";
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../main";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import { useAppData } from "../context/AppContext";



const Signin = () => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { setIsAuth, setUser } = useAppData();
  

  const responseGoogle = async (authResult: any) => {
    setProcessing(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`,{
        code: authResult.code,
      })

      localStorage.setItem("token", result.data.accessToken);
      toast.success(result.data.message);
      setProcessing(false);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    }
    catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });


  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-3xl font-bold text-[#E23774]">
          DropBite
        </h1>

        <p className="text-center text-sm text-gray-500">
          Log in or sign up to continue
        </p>

        <button
          onClick={googleLogin}
          disabled={processing}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          <FcGoogle size={20} />
          {processing ? "Signing in ..." : "Continue with Google"}
        </button>

        <p className="text-center text-xs text-gray-400">
          By continuing, you agree with our{" "}
          <span className="text-[#E23774]">Terms of Service</span> &{" "}
          <span className="text-[#E23774]">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}

export default Signin