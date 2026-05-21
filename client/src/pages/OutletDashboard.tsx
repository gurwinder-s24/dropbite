import { useEffect, useState } from "react";
import type { MenuItemInterface, OutletInterface } from "../types";
import axios from "axios";
import { outletService } from "../main";
import AddOutlet from "../components/AddOutlet";
import OutletProfile from "../components/OutletProfile";
import OutletOrders from "../components/OutletOrders";
import AddMenuItem from "../components/AddMenuItem";
import MenuItems from "../components/MenuItems";

type SellerTab = "menu" | "add-item" | "sales";

const Outlet = () => {
  const [outlet, setOutlet] = useState<OutletInterface | null>(null);
  const [fetchingOutlet, setFetchingOutlet] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");

  const fetchMyOutlet = async () => {
    try {
      const { data } = await axios.get(
        `${outletService}/api/outlet/my`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (data.token) {
        console.log("Token refreshed");
        localStorage.setItem("token", data.token);
        window.location.reload();
      }
      else {
        setOutlet(data.outlet || null);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setFetchingOutlet(false);
    }
  };
  useEffect(() => { fetchMyOutlet(); }, []);

  const [menuItems, setMenuItems] = useState<MenuItemInterface[]>([]);
  
  const fetchMenuItems = async (outletId: string) => {
    try {
      const { data } = await axios.get(
        `${outletService}/api/item/all/${outletId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (outlet?._id) { fetchMenuItems(outlet._id); }
  }, [outlet]);

  if (fetchingOutlet) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Loading your outlet...</p>
    </div>
  );

  if (!outlet) {
    return <AddOutlet fetchMyOutlet={fetchMyOutlet} />;
  }
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 space-y-6">
      <OutletProfile
        outlet={outlet}
        setOutlet={setOutlet}
        isSeller={true}
      />
      <OutletOrders outletId={outlet._id} />

      <div className="rounded-xl bg-white shadow-sm">
        <div className="flex border-b">
          {[
            { key: "menu", label: "Menu Items" },
            { key: "add-item", label: "Add Item" },
            { key: "sales", label: "Sales" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as SellerTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                tab === t.key
                  ? "border-b-2 border-red-500 text-red-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "menu" && (
            <MenuItems
              items={menuItems}
              fetchMenuItems={() => fetchMenuItems(outlet._id)}
              isSeller={true}
            />
          )}
          {tab === "add-item" && (
            <AddMenuItem fetchMenuItems={() => fetchMenuItems(outlet._id)} />
          )}
          {tab === "sales" && <p>Sales Page</p>}
        </div>
      </div>
      
    </div>
  );
};

export default Outlet;
