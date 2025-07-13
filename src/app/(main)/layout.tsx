"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/context/WardrobeContext";
import { MapPin, Sun, Cloud, CloudRain, CloudSnow } from "lucide-react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { weatherInfo, setWeatherInfo } = useWardrobe();
  const [currentDate, setCurrentDate] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
            if (!apiKey) {
              console.error("Weather API key is missing. Please add NEXT_PUBLIC_WEATHER_API_KEY to your .env file.");
              return;
            }
            const weatherResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`);
            const weatherData = await weatherResponse.json();
            
            if (weatherData && weatherData.error) {
              console.error("Weather API error:", weatherData.error.message);
              return;
            }
            
            if (weatherData && weatherData.location && weatherData.current) {
              setWeatherInfo({
                  location: `${weatherData.location.name}, ${weatherData.location.region}`,
                  weather: weatherData.current.condition.text,
                  temperature: weatherData.current.temp_f,
              });
            } else {
              console.error("Failed to fetch weather data: Invalid response format", weatherData);
            }
        } catch (error) {
            console.error("Failed to fetch weather data:", error);
        }
    };
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback to a default location if permission is denied
          fetchWeather(40.7128, -74.0060); // New York City
        }
      );
    }
  }, [setWeatherInfo]);

  const weatherIcons: { [key: string]: React.ReactNode } = {
    "clear": <Sun className="h-4 w-4 text-yellow-400" />,
    "clouds": <Cloud className="h-4 w-4 text-gray-400" />,
    "rain": <CloudRain className="h-4 w-4 text-blue-400" />,
    "snow": <CloudSnow className="h-4 w-4 text-blue-200" />,
  }

  const getWeatherIcon = (weather: string) => {
    const lowerWeather = weather.toLowerCase();
    for (const key in weatherIcons) {
        if (lowerWeather.includes(key)) {
            return weatherIcons[key];
        }
    }
    return <Sun className="h-4 w-4 text-yellow-400" />;
  }

  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
                <header className="flex h-16 items-center border-b bg-card px-4 sm:px-6 lg:px-8 w-full">
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
                                       <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {weatherInfo.location}</div>
                                       <div className="flex items-center gap-1">{getWeatherIcon(weatherInfo.weather)} {weatherInfo.temperature.toFixed(0)}°F</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                          <div className="h-9 w-48 bg-muted rounded animate-pulse" />
                        )}
                        <Button>Logout</Button>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
                    {children}
                </main>
            </div>
        </div>
    </SidebarProvider>
  );
}
