"use client";

import { useState } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';
import { Card, CardContent } from '../../../components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '../../../components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { format } from 'date-fns';
import Image from 'next/image';
import type { Outfit } from '../../../lib/types';
import { ScrollArea } from '../../../components/ui/scroll-area';

export default function CalendarPage() {
  const { outfits } = useWardrobe();
  const [plannedOutfits, setPlannedOutfits] = useState<Record<string, string>>({}); // date string -> outfit id
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleSelectOutfit = (outfitId: string) => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      setPlannedOutfits(prev => ({ ...prev, [dateString]: outfitId }));
    }
    setIsDialogOpen(false);
  };

  const getOutfitForDate = (date: Date): Outfit | undefined => {
    const dateString = format(date, 'yyyy-MM-dd');
    const outfitId = plannedOutfits[dateString];
    return outfits.find(o => o.id === outfitId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <CalendarIcon className="text-primary" /> Outfit Calendar
        </h1>
        <p className="text-muted-foreground">Plan your looks for the week ahead.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDayClick}
            className="w-full"
            components={{
              DayContent: ({ date }) => {
                const outfit = getOutfitForDate(date);
                return (
                  <div className="relative h-full w-full flex items-center justify-center">
                    <span>{date.getDate()}</span>
                    {outfit && outfit.items[0] && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full overflow-hidden border border-primary">
                        <Image
                          src={outfit.items[0].imageUrl}
                          alt={outfit.items[0].name}
                          width={16}
                          height={16}
                          data-ai-hint={outfit.items[0]['data-ai-hint']}
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Plan outfit for {selectedDate ? format(selectedDate, 'PPP') : ''}
            </DialogTitle>
            <DialogDescription>Select one of your saved outfits for this day.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] my-4">
            <div className="grid grid-cols-2 gap-4 pr-6">
              {outfits.map(outfit => (
                <div key={outfit.id} className="cursor-pointer" onClick={() => handleSelectOutfit(outfit.id)}>
                  <Card className="group overflow-hidden">
                    <div className="grid grid-cols-2 grid-rows-1 aspect-video bg-secondary">
                        {outfit.items.slice(0, 2).map(item => (
                             <div key={item.id} className="relative overflow-hidden border-2 border-background">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    data-ai-hint={item['data-ai-hint']}
                                    width={100}
                                    height={100}
                                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                />
                             </div>
                        ))}
                    </div>
                    <div className="p-2 border-t">
                        <h4 className="text-sm font-semibold truncate">{outfit.name}</h4>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
