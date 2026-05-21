import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService, outletService } from '../main';
import axios from 'axios';
import type { AppContextType, CartInterface, LocationDataInterface, UserInterface } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [user, setUser] = useState<UserInterface | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    async function fetchUser(){
        try {
            const { data } = await axios.get(`${authService}/api/auth/me`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}`},
            });

            setUser(data);
            setIsAuth(true);
        } 
        catch (error) { console.log(error); }
        finally { setLoading(false); }
    };
    // fetch user on each reload
    useEffect(()=> { fetchUser(); }, []);


    const [location, setLocation] = useState<LocationDataInterface | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("Fecthing Location...");    

    async function fetchLocation(){
        if (!navigator.geolocation)
        return alert("Please Allow Location to continue");
        setLoadingLocation(true);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const data = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                ).then((res) => res.json());
                console.log(data);

                setLocation({ latitude, longitude, formattedAddress: data.display_name || "current location" });
                setCity( data.address.city || data.address.town || data.address.village || "Your Location" );
                setLoadingLocation(false);
            } catch (error) {
                setLocation({ latitude, longitude, formattedAddress: "Current Location" });
                setCity("Failed to load");
                setLoadingLocation(false);
            }
        });
    }
    // fetch location on each reload
    useEffect(() => { fetchLocation() }, []);

    const [cart, setCart] = useState<CartInterface[]>([]);
    const [subTotal, setSubTotal] = useState(0);
    const [quantity, setQuantity] = useState(0);    

    async function fetchCart() {
        if (!user || user.role !== "customer") return;
        try {
        const { data } = await axios.get(`${outletService}/api/cart/all`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
        });

        setCart(data.cart || []);
        setSubTotal(data.subtotal || 0);
        setQuantity(data.cartLength || 0);
        } catch (error) {
        console.log(error);
        }
    }
    // fetch cart on each reload
    useEffect(() => { fetchUser(); }, []);
    // refetch cart whenever user info changes
    useEffect(() => {
        if (user && user.role === "customer") {
        fetchCart();
        }
    }, [user]);


    return (
    <AppContext.Provider value={ {
        user, setUser, loading, setLoading, isAuth, setIsAuth,
        location, setLocation, loadingLocation, setLoadingLocation, city, setCity,
        cart, subTotal, quantity, fetchCart
    } }>
        {children}
    </AppContext.Provider>
    )
};


export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
