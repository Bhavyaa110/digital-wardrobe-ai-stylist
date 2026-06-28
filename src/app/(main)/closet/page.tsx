"use client";

import { useState, useEffect } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card } from '../../../components/ui/card';
import { Shirt, Plus } from 'lucide-react';
import Image from 'next/image';
import type { Category } from '../../../lib/types';
import { AddClothingItemForm } from '../../../components/closet/AddClothingItemForm';

export default function ClosetPage() {
  const { clothingItems } = useWardrobe();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  const handleAddItemClick = () => {
    console.log('Add item button clicked!');
    setIsAddItemOpen(true);
  };

  const filteredItems = clothingItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.color.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    console.log('[ClosetPage] clothingItems changed:', clothingItems.length);
    console.log('[ClosetPage] Items:', clothingItems);
  }, [clothingItems]);

  console.log('[ClosetPage] Rendering with items:', clothingItems.length);

  return (
    <div className="space-y-6" style={{ position: 'relative', zIndex: 1 }}>
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Shirt className="text-primary" /> My Closet
        </h1>
        <p className="text-muted-foreground">Browse, filter, and manage all your clothing items.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <Input
            placeholder="Search by name, brand, color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as Category | 'All')}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
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
        </div>
        <Button 
          onClick={handleAddItemClick} 
          className="w-full sm:w-auto"
          style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
          type="button"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-secondary relative">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    data-ai-hint={item['data-ai-hint']}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Shirt className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{item.brand}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Shirt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Items Found</h3>
          <p className="text-muted-foreground mb-6">
            Your closet is empty or no items match your search.
          </p>
          <Button 
            onClick={handleAddItemClick}
            style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
            type="button"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Your First Item
          </Button>
        </Card>
      )}

      <AddClothingItemForm open={isAddItemOpen} onOpenChange={setIsAddItemOpen} />
    </div>
  );
}
