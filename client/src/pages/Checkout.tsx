import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { outletService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { AddressInterfaceLocal, CartInterface, MenuItemInterface, OutletInterface } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";
import { loadStripe } from "@stripe/stripe-js";

interface AddressInterfaceForCheckout extends AddressInterfaceLocal {
location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData();
  const [addresses, setAddresses] = useState<AddressInterfaceForCheckout[]>([]);
  const [selectedAddressId, setselectedAddressId] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const navigate = useNavigate();
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [inRange, setInRange] = useState(false);
  

   
  // fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${outletService}/api/address/all`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        setAddresses(data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddresses();
  }, [cart]);

  // check if selected address is in delivery range
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
  useEffect(() => {
    if (!selectedAddressId || !cart || cart.length === 0) {
      setInRange(false);
      return;
    };

    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    const currentOutlet = cart[0].outletId as OutletInterface;

    if (!selectedAddress || !currentOutlet?.autoLocation?.coordinates) {
      setInRange(false);
      return;
    }

    const distanceCheck = getDistanceKm(
      currentOutlet.autoLocation.coordinates[1],
      currentOutlet.autoLocation.coordinates[0],
      selectedAddress.location.coordinates[1],
      selectedAddress.location.coordinates[0]
    );
    console.log("Outlet:", currentOutlet.autoLocation.coordinates);
    console.log("User Address:", [selectedAddress.location.coordinates]);
    console.log("Calculated Distance (km):", distanceCheck);
    setInRange(distanceCheck <= 10);
  }, [selectedAddressId, addresses, cart]);

  // safe guard the render for empty cart
  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] item-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const outlet = cart[0].outletId as OutletInterface;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${outletService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      return data;
    } catch (error) {
      toast.error("Failed to create Order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "DropBite", // business name
        description: "Food Order Payment",
        order_id: razorpayOrderId,

        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment successfull 🎉");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#E23744",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error("Payment Failed please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;

      const { orderId } = order;
      try {
        await stripePromise;

        const { data } = await axios.post(
          `${utilsService}/api/payment/stripe/create`,
          { orderId }
        );

        if (data.url) {
          window.location.href = data.url as string;
        } else {
          toast.error("failed to create payment session");
        }
      } catch (error) {
        toast.error("Payment Failed");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{outlet.name}</h2>
        <p className="text-sm text-gray-500">
          {outlet.autoLocation.formattedAddress}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Delivery Address</h3>

        {loadingAddress ? (
          <p className="text-sm text-gray-500">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <div className="flex gap-1">  
            <p className="text-sm text-gray-500">
              No address found. Please add one
            </p>
            <button
              onClick={() => navigate("/address")}
              className="text-sm px-2 hover:underline text-rose-500"
              >
              + Add Address
            </button>
          </div>
        ) : (
          <div>
            {addresses.map((add) => (
              <label
                key={add._id}
                className={`mb-2 flex gap-3 rounded-lg border p-3 cursor-pointer transition ${
                  selectedAddressId === add._id
                  ? "border-[#e23744] bg-red-50"
                  : "hover:bg-gray-50"
                }`}
                >
                <input
                  type="radio"
                  checked={selectedAddressId === add._id}
                  onChange={() => setselectedAddressId(add._id)}
                  />
                <div>
                  <p className="text-sm font-medium">{add.formattedAddress}</p>
                  <p className="text-xs text-gray-500">{add.mobile}</p>
                </div>
              </label>
            ))}

            {selectedAddressId && !inRange && (
              <p className="text-sm font-semibold text-red-500 m-2">
                Out of delivery range. Please choose an address within 10km.
              </p>
            )}
          </div> 
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h3 className="font-semibold">Order Summary</h3>

        {cart.map((cartItem: CartInterface) => {
          const item = cartItem.itemId as MenuItemInterface;

          return (
            <div className="flex justify-between text-sm" key={cartItem._id}>
              <span>
                {item.name} x {cartItem.quantity}
              </span>
              <span>₹{item.price * cartItem.quantity}</span>
            </div>
          );
        })}

        <hr />

        <div className="flex justify-between text-sm">
          <span>Items ({quantity})</span>
          <span>₹{subTotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>PlatForm Fee</span>
          <span>₹{platformFee}</span>
        </div>

        {subTotal < 250 && (
          <p className="text-xs text-gray-500">
            Add Item worth ₹{250 - subTotal} more to get Free delivery
          </p>
        )}

        <div className="flex justify-between text-base font-semibold border-t pt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Payment Method</h3>

        <button
          disabled={!selectedAddressId || !inRange || loadingRazorpay || creatingOrder}
          onClick={payWithRazorpay}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D7FF9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay With Razorpay
        </button>

        <button
          disabled={!selectedAddressId || !inRange || loadingStripe || creatingOrder}
          onClick={payWithStripe}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loadingStripe ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay With Stripe
        </button>
      </div>
    </div>
  );
};

export default Checkout;
