import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { MenuItemInterface, OutletInterface } from "../types";
import axios from "axios";
import { outletService } from "../main";
import MenuItems from "../components/MenuItems";
import OutletProfile from "../components/OutletProfile";

const OutletPage = () => {
  const { outletId } = useParams();

  const [outlet, setOutlet] = useState<OutletInterface | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemInterface[]>([]);
  const [fetchingOutlet, setFetchingOutlet] = useState(true);

  const fetchOutlet = async () => {
    try {
        console.log("Fetching outlet with ID:", outletId);
      const { data } = await axios.get(
        `${outletService}/api/outlet/${outletId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOutlet(data || null);
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingOutlet(false);
    }
  };

  const fetchMenuItems = async () => {+
    console.log("Fetching menu items for outlet ID:", outletId);
    try {
      const { data } = await axios.get(
        `${outletService}/api/item/all/${outletId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (outletId) {
      fetchOutlet();
      fetchMenuItems();
    }
  }, [outletId]);

  if (fetchingOutlet) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading outlet...</p>
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-gray-500">No Outlet with this id</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <OutletProfile
        outlet={outlet}
        setOutlet={setOutlet}
        isSeller={false}
      />

      <div className="rounded-xl bg-white shadow-sm p-4">
        <MenuItems
          items={menuItems}
          fetchMenuItems={fetchMenuItems}
          isSeller={false}
        />
      </div>
    </div>
  );
};

export default OutletPage;
