import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Hotel = {
  id: string;
  name: string;
  slug: string;
  brand_color: string | null;
  city: string;
};

type HotelContextType = {
  activeHotel: Hotel | null;
  setActiveHotel: (hotel: Hotel) => void;
  hotels: Hotel[];
  loading: boolean;
};

const HotelContext = createContext<HotelContextType>({
  activeHotel: null,
  setActiveHotel: () => {},
  hotels: [],
  loading: true,
});

export const HotelProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeHotel, setActiveHotelState] = useState<Hotel | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      const { data, error } = await supabase.from("hotels").select("*");
      if (data) {
        setHotels(data as Hotel[]);
        // Try to recover from local storage
        const savedHotelId = localStorage.getItem("ouril_active_hotel_id");
        const savedHotel = data.find(h => h.id === savedHotelId);
        if (savedHotel) {
          setActiveHotelState(savedHotel as Hotel);
          document.documentElement.style.setProperty("--primary", (savedHotel as Hotel).brand_color || "hsl(var(--gold))");
        } else if (data.length > 0) {
          // Default to first hotel (e.g. Mindelo)
          setActiveHotelState(data[0] as Hotel);
          document.documentElement.style.setProperty("--primary", (data[0] as Hotel).brand_color || "hsl(var(--gold))");
        }
      }
      setLoading(false);
    };
    fetchHotels();
  }, []);

  const setActiveHotel = (hotel: Hotel) => {
    setActiveHotelState(hotel);
    localStorage.setItem("ouril_active_hotel_id", hotel.id);
    // Force refresh or update branding
    document.documentElement.style.setProperty("--primary", hotel.brand_color || "hsl(var(--gold))");
  };

  return (
    <HotelContext.Provider value={{ activeHotel, setActiveHotel, hotels, loading }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => useContext(HotelContext);
