import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Hotel = {
  id: string;
  name: string;
  slug: string;
  brand_color: string | null;
  city: string;
  primary_color?: string | null;
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

const applyBranding = (hotel: Hotel) => {
  const color = hotel.brand_color || hotel.primary_color || null;
  if (color) {
    document.documentElement.style.setProperty("--primary", color);
  }
};

export const HotelProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeHotel, setActiveHotelState] = useState<Hotel | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const resolveActiveHotel = (data: Hotel[], userMetaHotelId?: string | null) => {
    // Priority 1: hotel_id from user metadata (production auth)
    if (userMetaHotelId) {
      const fromMeta = data.find(h => h.id === userMetaHotelId);
      if (fromMeta) return fromMeta;
    }
    // Priority 2: saved in localStorage (dev mode / staff switcher)
    const savedId = localStorage.getItem("ouril_active_hotel_id");
    if (savedId) {
      const fromStorage = data.find(h => h.id === savedId);
      if (fromStorage) return fromStorage;
    }
    // Priority 3: default to first hotel
    return data[0] ?? null;
  };

  useEffect(() => {
    const fetchHotels = async () => {
      const { data, error } = await supabase.from("hotels").select("*");
      if (error || !data) {
        setLoading(false);
        return;
      }

      const hotelList = data as Hotel[];
      setHotels(hotelList);

      // Get current user's hotel_id from metadata
      const { data: { user } } = await supabase.auth.getUser();
      const userMetaHotelId = (user?.user_metadata as any)?.hotel_id ?? null;

      const resolved = resolveActiveHotel(hotelList, userMetaHotelId);
      if (resolved) {
        setActiveHotelState(resolved);
        applyBranding(resolved);
      }

      setLoading(false);
    };

    fetchHotels();

    // Re-sync when auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const userMetaHotelId = (session?.user?.user_metadata as any)?.hotel_id ?? null;
      if (!userMetaHotelId) return;

      setHotels(prev => {
        const match = prev.find(h => h.id === userMetaHotelId);
        if (match) {
          setActiveHotelState(match);
          applyBranding(match);
          localStorage.setItem("ouril_active_hotel_id", match.id);
        }
        return prev;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const setActiveHotel = (hotel: Hotel) => {
    setActiveHotelState(hotel);
    localStorage.setItem("ouril_active_hotel_id", hotel.id);
    applyBranding(hotel);
  };

  return (
    <HotelContext.Provider value={{ activeHotel, setActiveHotel, hotels, loading }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => useContext(HotelContext);
