"use client";

import { useState, useEffect } from "react";
import { useWardrobe } from "../../../context/WardrobeContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { format, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import Image from "next/image";
import type { Outfit } from "../../../lib/types";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Badge } from "../../../components/ui/badge";
import { useToast } from "../../../hooks/use-toast";

export default function CalendarPage() {
  const { outfits } = useWardrobe();
  const { toast } = useToast();
  const [plannedOutfits, setPlannedOutfits] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const getToken = () => localStorage.getItem('fitzy_token');

  // Load calendar plans from DB on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = getToken();
        const res = await fetch('/api/calendar', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPlannedOutfits(data);
        }
      } catch (err) {
        console.error('Failed to load calendar plans:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleSelectOutfit = async (outfitId: string) => {
    const dateString = format(selectedDate, "yyyy-MM-dd");
    setIsSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: dateString, outfitId }),
      });

      if (!res.ok) throw new Error('Failed to save');

      setPlannedOutfits((prev) => ({ ...prev, [dateString]: outfitId }));
      setIsDialogOpen(false);
      toast({ title: 'Outfit planned!', description: `Saved for ${format(selectedDate, "MMMM d, yyyy")}` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to save outfit plan' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveOutfit = async () => {
    const dateString = format(selectedDate, "yyyy-MM-dd");
    setIsSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/calendar?date=${dateString}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete');

      setPlannedOutfits((prev) => {
        const next = { ...prev };
        delete next[dateString];
        return next;
      });
      toast({ title: 'Outfit removed' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Failed to remove outfit plan' });
    } finally {
      setIsSaving(false);
    }
  };

  const getOutfitForDate = (date: Date): Outfit | undefined => {
    const dateString = format(date, "yyyy-MM-dd");
    const outfitId = plannedOutfits[dateString];
    return outfits.find((o) => o.id === outfitId);
  };

  const goToPreviousMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    const startDay = start.getDay();
    const paddingDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      paddingDays.push(new Date(start.getFullYear(), start.getMonth(), -i));
    }
    return [...paddingDays, ...days];
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedOutfit = getOutfitForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <CalendarIcon className="text-primary" />
          Outfit Calendar
        </h1>
        <p className="text-muted-foreground">Plan your outfits for the week ahead and never worry about what to wear.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {days.map((day, idx) => {
                    const outfit = getOutfitForDate(day);
                    const today = isToday(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDayClick(day)}
                        className={`
                          relative aspect-square rounded-lg p-2 flex flex-col items-center justify-center
                          transition-all hover:shadow-md hover:scale-105
                          ${!isCurrentMonth ? 'text-muted-foreground opacity-40' : ''}
                          ${today ? 'bg-primary/10 border-2 border-primary font-bold' : 'border border-border'}
                          ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}
                          ${outfit ? 'bg-accent' : 'bg-background hover:bg-accent/50'}
                        `}
                      >
                        <span className="text-sm">{format(day, 'd')}</span>
                        {outfit && (
                          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Outfit Preview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">{format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              {isToday(selectedDate) && <Badge className="w-fit">Today</Badge>}
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedOutfit ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedOutfit.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-secondary border-2 border-muted">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">{selectedOutfit.name}</h4>
                    <Badge variant="outline">{selectedOutfit.occasion}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsDialogOpen(true)} disabled={isSaving}>
                      Change
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={handleRemoveOutfit} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-1" /> Remove</>}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No outfit planned for this day</p>
                  <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)}>
                    Plan an Outfit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Outfit Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Choose Outfit for {format(selectedDate, "MMMM d, yyyy")}</DialogTitle>
            <DialogDescription>Select one of your saved outfits to wear on this day.</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {outfits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {outfits.map((outfit) => {
                  const isSelected = plannedOutfits[format(selectedDate, "yyyy-MM-dd")] === outfit.id;
                  return (
                    <Card
                      key={outfit.id}
                      className={`cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] group ${isSelected ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => !isSaving && handleSelectOutfit(outfit.id)}
                    >
                      <div className="grid grid-cols-2 gap-2 p-4">
                        {outfit.items.slice(0, 4).map((item) => (
                          <div key={item.id} className="relative aspect-square rounded-md overflow-hidden bg-secondary">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ))}
                      </div>
                      <div className="px-4 pb-4 flex items-center justify-between">
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-semibold truncate">{outfit.name}</h4>
                          <Badge variant="secondary" className="text-xs">{outfit.occasion}</Badge>
                        </div>
                        {isSelected && <Badge className="ml-2 shrink-0">Selected</Badge>}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">You don't have any saved outfits yet.</p>
                <Button variant="outline" asChild>
                  <a href="/mix-and-match">Create Your First Outfit</a>
                </Button>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}