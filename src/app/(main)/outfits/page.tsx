"use client";

import { useWardrobe } from "../../../context/WardrobeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Pin, PinOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export default function OutfitsPage() {
  const { outfits, updateOutfit } = useWardrobe();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Outfits</h1>
          <p className="text-muted-foreground">All your saved looks in one place.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/mix-and-match">
                <Button>
                    <Plus className="mr-2 h-4 w-4"/> Create Outfit
                </Button>
            </Link>
             <Link href="/generate">
                <Button variant="secondary">
                    AI Stylist
                </Button>
            </Link>
        </div>
      </div>

      {outfits.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {outfits.map((outfit) => (
            <Card key={outfit.id} className="overflow-hidden group relative">
                 <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/20 hover:bg-black/50 border-none text-white">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateOutfit({...outfit, pinned: !outfit.pinned})}>
                               {outfit.pinned ? <PinOff className="mr-2 h-4 w-4"/> : <Pin className="mr-2 h-4 w-4"/>}
                               {outfit.pinned ? 'Unpin from Home' : 'Pin to Home'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {outfit.pinned && <div className="absolute top-2 left-2 z-10 bg-primary rounded-full p-1.5"><Pin className="h-4 w-4 text-primary-foreground"/></div>}
              <CardContent className="p-0">
                <div className="grid grid-cols-2 grid-rows-2 aspect-square bg-secondary">
                  {outfit.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="relative overflow-hidden border-2 border-background">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={200}
                        height={200}
                        data-ai-hint={item['data-ai-hint']}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                   {outfit.items.length < 4 && [...Array(4 - outfit.items.length)].map((_, i) => <div key={i} className="bg-secondary border-2 border-background"></div>)}
                </div>
                 <div className="p-4 border-t">
                  <CardTitle className="text-base">{outfit.name}</CardTitle>
                  <CardDescription>{outfit.occasion}</CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardTitle>No Outfits Yet</CardTitle>
          <CardDescription className="mt-2">
            You haven't saved any outfits.
            <br />
            Let's create your first look!
          </CardDescription>
          <Link href="/mix-and-match" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4"/> Create an Outfit
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
