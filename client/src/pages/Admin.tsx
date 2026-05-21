import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import PendingOutletCard from "../components/PendingOutletCard";
import PendingRiderCard from "../components/PendingRiderCard";


const Admin = () => {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"outlets" | "riders">("outlets");

  const fetchData = async () => {
    try {
      const pendingOutletsResponse = await axios.get(
        `${adminService}/api/v1/admin/outlet/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const pendingRidersResponse = await axios.get(
        `${adminService}/api/v1/admin/rider/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOutlets(pendingOutletsResponse.data.outlets);
      setRiders(pendingRidersResponse.data.riders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="flex gap-4">
        <button
          onClick={() => setTab("outlets")}
          className={`px-4 py-2 rounded ${
            tab === "outlets" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          Outlets
        </button>

        <button
          onClick={() => setTab("riders")}
          className={`px-4 py-2 rounded ${
            tab === "riders" ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          Riders
        </button>
      </div>

      {tab === "outlets" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outlets.length === 0 ? (
            <p>No pending outlets</p>
          ) : (
            outlets.map((o) => (
              <PendingOutletCard
                key={o._id}
                outlet={o}
                onVerify={fetchData}
              />
            ))
          )}
        </div>
      )}
      {tab === "riders" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {riders.length === 0 ? (
            <p>No pending riders</p>
          ) : (
            riders.map((r) => (
              <PendingRiderCard key={r._id} rider={r} onVerify={fetchData} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
