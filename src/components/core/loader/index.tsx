import Lottie from "lottie-react";
import loadingAnim from "@/assets/Loading.json";

export default function Loader() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-10 w-10">
        <Lottie animationData={loadingAnim} loop={true} />
      </div>
    </div>
  );
}

