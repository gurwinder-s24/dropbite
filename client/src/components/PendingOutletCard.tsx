import toast from "react-hot-toast";
import { adminService } from "../main";
import axios from "axios";

const PendingOutletCard = ({ outlet, onVerify } : { outlet: any; onVerify: () => void }) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/outlet/${outlet._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Outlet verified");
      onVerify();
    } catch (error) {
      toast.error("failed to verify outlet");
    }
  };
  return (
    <div className="rounded-xl bg-white p-4 shadow space-y-2">
      <img
        src={outlet.image}
        className="h-40 w-full object-cover rounded"
        alt=""
      />
      <h3>{outlet.name}</h3>
      <p className="text-sm text-gray-500">{outlet.phone}</p>
      <p>{outlet.autoLocation?.formattedAddress}</p>

      <button
        className="w-full rounded bg-green-500 py-2 text-white hover:bg-green-600"
        onClick={verify}
      >
        Verify Outlet
      </button>
    </div>
  );
}

export default PendingOutletCard