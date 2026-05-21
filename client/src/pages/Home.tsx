import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { OutletInterface } from "../types";
import axios from "axios";
import { outletService } from "../main";
import OutletCard from "../components/OutletCard";

const Home = () => {
  const { location } = useAppData();
  const [searchParams] = useSearchParams();

  const search = searchParams.get("search") || "";

  const [outlets, setOutlets] = useState<OutletInterface[]>([]);
  const [fetchingOutlets, setFetchingOutlets] = useState(true);

  // Haversine formula to calculate distance between two coordinates
  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchOutlets = async () => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    try {
      setFetchingOutlets(true);

      const { data } = await axios.get(
        `${outletService}/api/outlet/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );

      setOutlets(data.outlets ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingOutlets(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, [location, search]);

  if (fetchingOutlets || !location) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Finding outlets near you...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {outlets.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {outlets.map((outlet) => {
            const [outletLongitude, outletLatitude] = outlet.autoLocation.coordinates;

            const distance = getDistanceKm(
              location.latitude,
              location.longitude,
              outletLatitude,
              outletLongitude
            );

            return (
              <OutletCard
                key={outlet._id}
                outletId={outlet._id}
                name={outlet.name}
                image={outlet.image ?? ""}
                distance={`${distance}`}
                isOpen={outlet.isOpen}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">No Outlet found</p>
      )}
    </div>
  );
};

export default Home;
