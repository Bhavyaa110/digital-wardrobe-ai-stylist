"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppSidebar } from "../../components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Button } from "../../components/ui/button";
import { MapPin, Sun, Cloud, CloudRain, CloudSnow } from "lucide-react";
import { useWardrobe } from "../../context/WardrobeContext";
import { useState } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth(); // 👈 get user from context
  const router = useRouter();
  const { weatherInfo, setWeatherInfo } = useWardrobe();
  const [currentDate, setCurrentDate] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 🚫 Redirect if user not logged in
    if (!user) {
      router.push("/login");
    }
    setIsClient(true);
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
        if (!apiKey) return;
        const weatherResponse = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`
        );
        const weatherData = await weatherResponse.json();
        if (weatherData?.location && weatherData?.current) {
          setWeatherInfo({
            location: `${weatherData.location.name}, ${weatherData.location.region}`,
            weather: weatherData.current.condition.text,
            temperature: weatherData.current.temp_f,
          });
        }
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          fetchWeather(40.7128, -74.006); // NYC fallback
        }
      );
    }
  }, [user]);

  const weatherIcons: { [key: string]: React.ReactNode } = {
    clear: <Sun className="h-4 w-4 text-yellow-400" />,
    clouds: <Cloud className="h-4 w-4 text-gray-400" />,
    rain: <CloudRain className="h-4 w-4 text-blue-400" />,
    snow: <CloudSnow className="h-4 w-4 text-blue-200" />,
  };

  const getWeatherIcon = (weather: string) => {
    const lower = weather.toLowerCase();
    return (
      Object.entries(weatherIcons).find(([key]) => lower.includes(key))?.[1] ??
      <Sun className="h-4 w-4 text-yellow-400" />
    );
  };

  if (!user) return null; // prevent flash before redirect

  return (
  <SidebarProvider>
    <div className="flex flex-col min-h-screen w-full">
      <div className="flex flex-1">
        <AppSidebar />
        <div className="flex-1 flex flex-col w-full">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b bg-card px-4 sm:px-6 lg:px-8 w-full">
            <div className="lg:hidden">
              <SidebarTrigger />
            </div>
            <div className="flex-1" />

            <div className="flex items-center gap-4">
              {isClient ? (
                <div className="text-right text-sm">
                  <div className="font-medium text-foreground">{currentDate}</div>
                  {weatherInfo && (
                    <div className="text-muted-foreground flex items-center justify-end gap-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {weatherInfo.location}
                      </div>
                      <div className="flex items-center gap-1">
                        {getWeatherIcon(weatherInfo.weather)}{" "}
                        {weatherInfo.temperature.toFixed(0)}°F
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-9 w-48 bg-muted rounded animate-pulse" />
              )}
              <Button onClick={logout}>Logout</Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background w-full overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  </SidebarProvider>
);
}