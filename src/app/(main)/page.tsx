"use client";

import { useWardrobe } from "../../context/WardrobeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle, Sparkles, Swords, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
export default function DashboardPage() {
  const { outfits } = useWardrobe();
  const { user } = useAuth();
  const pinnedOutfits = outfits.filter((o) => o.pinned);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Welcome back, {user?.name || "Cutie"}!
        </h1>
        <p className="text-muted-foreground">
          Here's your style summary and quick actions.
        </p>
      </div>

      {/* Quick Actions Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/closet">
          <Card className="hover:bg-card hover:shadow-soft-md hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Add to Closet
              </CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Upload a new clothing item to get started.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/generate">
          <Card className="hover:bg-card hover:shadow-soft-md hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">AI Stylist</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Get outfit suggestions from our AI.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/mix-and-match">
          <Card className="hover:bg-card hover:shadow-soft-md hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mix & Match</CardTitle>
              <Swords className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Create your own outfits manually.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Pinned Outfits Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-headline">Pinned Outfits</h2>
          <Link href="/outfits">
            <Button variant="ghost">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {pinnedOutfits.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pinnedOutfits.map((outfit) => (
              <Card key={outfit.id} className="overflow-hidden group">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 grid-rows-2 aspect-square">
                    {outfit.items
                      .slice(0, 4)
                      .map(
                        (item: {
                          id: string;
                          imageUrl: string;
                          name: string;
                        }) => (
                          <div
                            key={item.id}
                            className="relative overflow-hidden"
                          >
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={200}
                              height={200}
                            />
                          </div>
                        )
                      )}
                    {outfit.items.length < 4 &&
                      [...Array(4 - outfit.items.length)].map((_, i) => (
                        <div key={i} className="bg-secondary"></div>
                      ))}
                  </div>
                  <div className="p-4">
                    <CardTitle className="text-base">{outfit.name}</CardTitle>
                    <CardDescription>{outfit.occasion}</CardDescription>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardTitle>No Pinned Outfits</CardTitle>
            <CardDescription className="mt-2">
              You haven't pinned any favorite outfits yet.
              <br />
              Create or save an outfit and pin it to see it here!
            </CardDescription>
            <Link href="/outfits" className="mt-4">
              <Button>Explore Outfits</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
