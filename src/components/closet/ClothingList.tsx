"use client";

import { useState } from "react";
import { useWardrobe } from "../../context/WardrobeContext";
import { Card, CardContent } from "../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import Image from "next/image";
import { AddClothingItemForm } from "./AddClothingItemForm";
import { Plus, Trash2, Pin, PinOff } from 'lucide-react';
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";


export function ClothingList() {
  const { clothingItems, removeClothingItem, updateClothingItem } = useWardrobe();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredItems = clothingItems.filter(item => {
    const categoryMatch = filter === "All" || item.category === filter;
    const searchMatch = searchTerm === "" || 
                        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.color.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input 
          placeholder="Search by name, brand, color..." 
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Tops">Tops</SelectItem>
            <SelectItem value="Bottoms">Bottoms</SelectItem>
            <SelectItem value="Outerwear">Outerwear</SelectItem>
            <SelectItem value="Footwear">Footwear</SelectItem>
            <SelectItem value="Accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsSheetOpen(true)} className="sm:ml-auto">
          <Plus className="mr-2 h-4 w-4"/> Add New Item
        </Button>
      </div>
      
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map(item => (
            <Card key={item.id} className="group overflow-hidden relative">
              <CardContent className="p-0">
                <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/20 hover:bg-black/50 border-none text-white">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateClothingItem({...item, pinned: !item.pinned})}>
                               {item.pinned ? <PinOff className="mr-2 h-4 w-4"/> : <Pin className="mr-2 h-4 w-4"/>}
                               {item.pinned ? 'Unpin' : 'Pin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeClothingItem(item.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4"/> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {item.pinned && <div className="absolute top-2 left-2 z-10 bg-primary rounded-full p-1.5"><Pin className="h-4 w-4 text-primary-foreground"/></div>}
                <div className="aspect-square w-full overflow-hidden">
                    <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={300}
                    height={300}
                    data-ai-hint={item['data-ai-hint']}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="p-4 border-t">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                   <div className="mt-2 flex flex-wrap gap-1">
                        {item.styleTags.slice(0,2).map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="col-span-full flex flex-col items-center justify-center p-12 text-center">
            <h3 className="text-xl font-semibold">No Items Found</h3>
            <p className="mt-2 text-muted-foreground">
              Your closet is empty or no items match your search.
            </p>
            <Button onClick={() => setIsSheetOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4"/> Add Your First Item
            </Button>
          </Card>
      )}

      <AddClothingItemForm open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
