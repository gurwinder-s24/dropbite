export interface UserInterface {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
};

export interface LocationDataInterface {
  latitude: number;
  longitude: number;
  formattedAddress: string;
};

export interface AppContextType {
  user: UserInterface | null; 
  setUser: React.Dispatch<React.SetStateAction<UserInterface | null>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isAuth: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;

  location: LocationDataInterface | null;
  setLocation: React.Dispatch<React.SetStateAction<LocationDataInterface | null>>;
  loadingLocation: boolean;
  setLoadingLocation: React.Dispatch<React.SetStateAction<boolean>>;
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;

  cart: CartInterface[] | [];
  subTotal: number;
  quantity: number;
  fetchCart: () => void;
};

export interface OutletInterface {
  _id: string;
  ownerId: string;
  name: string;
  description?: string;
  image: string;
  phone: number;
  isVerified: boolean;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude]
    formattedAddress: string;
  };
  isOpen: boolean;
  createdAt: Date;
}


export interface MenuItemInterface {
  _id: string;
  outletId: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface CartInterface {
  _id: string;
  userId: string;
  outletId: string | OutletInterface;
  itemId: string | MenuItemInterface;
  quantity: number;
}

export interface AddressInterfaceLocal {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

export interface OrderInterface {
  _id: string;
  userId: string;
  outletId: string;
  outletName: string;
  riderId?: string | null;
  riderPhone: number | null;
  riderName: string | null;
  distance: number;
  riderAmount: number;

  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];

  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;

  addressId: string;

  deliveryAddress: {
    formattedAddress: string;
    mobile: number;
    latitude: number;
    longitude: number;
  };

  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_rider"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";

  paymentMethod: "razorpay" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";

  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
