"use client";

import { useState } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import Image from 'next/image';
import { Plus, X, Swords } from 'lucide-react';
import type { ClothingItem } from '../../../lib/types';
import { useToast } from '../../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import type { Occasion } from '../../../lib/types';


export default function MixAndMatchPage() {
  const { clothingItems, createOutfit } = useWardrobe();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState<Occasion>('Casual');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleItemSelect = (item: ClothingItem) => {
    if (!selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const handleItemRemove = (itemId: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== itemId));
  };
  
  const handleSaveOutfit = () => {
    if (selectedItems.length < 2) {
      toast({ variant: 'destructive', title: 'Not enough items', description: 'Please select at least two items for an outfit.' });
      return;
    }
    if (!outfitName) {
      toast({ variant: 'destructive', title: 'Missing Name', description: 'Please give your outfit a name.' });
      return;
    }

    createOutfit({
      name: outfitName,
      occasion: outfitOccasion,
      items: selectedItems,
    });

    toast({ title: 'Outfit Saved!', description: `${outfitName} has been saved.` });
    setSelectedItems([]);
    setOutfitName('');
    setOutfitOccasion('Casual');
    setIsDialogOpen(false);
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><Swords className="text-primary"/>Mix & Match</h1>
        <p className="text-muted-foreground">Create your own outfits by combining items from your closet.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 flex-1">
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle>Your Closet</CardTitle>
            <CardDescription>Click to add items to your outfit.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-grow">
              <div className="p-4 sm:p-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-4">
                {clothingItems.map(item => (
                  <div key={item.id} className="relative group cursor-pointer" onClick={() => handleItemSelect(item)}>
                    <div className="aspect-square rounded-md overflow-hidden">
                      <Image src={item.imageUrl} alt={item.name} data-ai-hint={item['data-ai-hint']} width={100} height={100} className="w-full h-full object-cover"/>
                    </div>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-8 w-8 text-white"/>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>New Outfit</CardTitle>
                    <CardDescription>Combine items to create a new look.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={selectedItems.length === 0}>Save Outfit</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Save your outfit</DialogTitle>
                            <DialogDescription>Give your new creation a name and occasion.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="outfit-name">Outfit Name</Label>
                                <Input id="outfit-name" value={outfitName} onChange={(e) => setOutfitName(e.target.value)} placeholder="e.g., Casual Friday Look" />
                            </div>
                            <div className="space-y-2">
                                <Label>Occasion</Label>
                                <Select value={outfitOccasion} onValueChange={(v) => setOutfitOccasion(v as Occasion)}>
                                    <SelectTrigger><SelectValue placeholder="Select occasion" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Casual">Casual</SelectItem>
                                        <SelectItem value="Formal">Formal</SelectItem>
                                        <SelectItem value="Sporty">Sporty</SelectItem>
                                        <SelectItem value="Work">Work</SelectItem>
                                        <SelectItem value="Party">Party</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveOutfit}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
             {selectedItems.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedItems.map(item => (
                       <div key={item.id} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden">
                                <Image src={item.imageUrl} alt={item.name} data-ai-hint={item['data-ai-hint']} width={200} height={200} className="w-full h-full object-cover"/>
                            </div>
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleItemRemove(item.id)}>
                                <X className="h-4 w-4"/>
                            </Button>
                            <p className="text-sm font-medium truncate mt-2">{item.name}</p>
                       </div>
                    ))}
                 </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-center bg-secondary rounded-lg p-4">
                    <h3 className="text-xl font-semibold">Your canvas is ready</h3>
                    <p className="mt-2 text-muted-foreground">Select items from your closet to start building an outfit.</p>
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
