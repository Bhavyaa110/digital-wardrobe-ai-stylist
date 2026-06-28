"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "../../components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Button } from "../../components/ui/button";
import { MapPin, Sun, Cloud, CloudRain, CloudSnow } from "lucide-react";
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
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
        if (!apiKey) {
          console.error('Weather API key not configured');
          return;
        }
        const weatherResponse = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`
        );
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          if (weatherData?.location && weatherData?.current) {
            setWeatherInfo({
              location: `${weatherData.location.name}, ${weatherData.location.region}`,
              weather: weatherData.current.condition.text,
              temperature: weatherData.current.temp_c,
            });
          }
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
          fetchWeather(40.7128, -74.006);
        }
      );
    } else {
      fetchWeather(40.7128, -74.006);
    }
  }, [user, router]);

  const weatherIcons: { [key: string]: React.ReactNode } = {
    clear: <Sun className="h-4 w-4 text-yellow-400" />,
    sunny: <Sun className="h-4 w-4 text-yellow-400" />,
    clouds: <Cloud className="h-4 w-4 text-gray-400" />,
    cloudy: <Cloud className="h-4 w-4 text-gray-400" />,
    rain: <CloudRain className="h-4 w-4 text-blue-400" />,
    rainy: <CloudRain className="h-4 w-4 text-blue-400" />,
    snow: <CloudSnow className="h-4 w-4 text-blue-200" />,
  };

  const getWeatherIcon = (weather: string) => {
    const lower = weather.toLowerCase();
    for (const [key, icon] of Object.entries(weatherIcons)) {
      if (lower.includes(key)) return icon;
    }
    return <Sun className="h-4 w-4 text-yellow-400" />;
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <div className="flex flex-1">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-h-0">
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
                      {weatherInfo ? (
                        <div className="text-muted-foreground flex items-center justify-end gap-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {weatherInfo.location}
                          </div>
                          <div className="flex items-center gap-1">
                            {getWeatherIcon(weatherInfo.weather)}{" "}
                            {weatherInfo.temperature.toFixed(0)}°C
                          </div>
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-xs">Loading weather...</div>
                      )}
                    </div>
                  ) : (
                    <div className="h-9 w-48 bg-muted rounded animate-pulse" />
                  )}
                  <Button onClick={logout}>Logout</Button>
                </div>
              </header>

              {/* Main content */}
              <main className="flex-1 overflow-y-auto min-h-0">
                <div className="container mx-auto p-6">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}