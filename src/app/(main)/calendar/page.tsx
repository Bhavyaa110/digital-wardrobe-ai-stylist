"use client";

import { useState } from "react";
import { useWardrobe } from "../../../context/WardrobeContext";
import { Card, CardContent } from "../../../components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "../../../components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { format } from "date-fns";
import Image from "next/image";
import type { Outfit } from "../../../lib/types";
import { ScrollArea } from "../../../components/ui/scroll-area";

export default function CalendarPage() {
  const { outfits } = useWardrobe();
  const [plannedOutfits, setPlannedOutfits] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleSelectOutfit = (outfitId: string) => {
    if (selectedDate) {
      const dateString = format(selectedDate, "yyyy-MM-dd");
      setPlannedOutfits((prev) => ({ ...prev, [dateString]: outfitId }));
    }
    setIsDialogOpen(false);
  };

  // make this defensive: accept unknown and return undefined for invalid inputs
  const getOutfitForDate = (date: unknown): Outfit | undefined => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return undefined;
    const dateString = format(date, "yyyy-MM-dd");
    const outfitId = plannedOutfits[dateString];
    return outfits.find((o) => o.id === outfitId);
  };

  // ✅ Safe goToMonth access with fallback
  const CustomCaption = (props: any) => {
    // react-day-picker may use different prop names depending on version:
    // try common ones: calendarMonth, month, displayMonth
    const candidate: Date | undefined =
      (props && (props.calendarMonth ?? props.month ?? props.displayMonth)) ?? undefined;

    // Validate it's a real Date
    const calendarMonth =
      candidate instanceof Date && !isNaN(candidate.getTime()) ? candidate : undefined;

    // goToMonth might be provided as goToMonth or as a callback prop with a different name
    const goToMonth = (props && (props.goToMonth ?? props.onMonthChange)) as
      | ((date: Date) => void)
      | undefined;

    // Determine a safe base date for label and navigation
    const baseDate = calendarMonth ?? new Date();

    // Format label only when baseDate is valid
    let label = "";
    try {
      label = format(baseDate, "LLLL yyyy");
    } catch {
      label = ""; // fallback to empty if format unexpectedly fails
    }

    const prevMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1);
    const nextMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1);

    return (
      <div className="relative flex items-center justify-between px-4 py-2">
        <button
          type="button"
          onClick={() => goToMonth?.(prevMonth)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">
          {label || format(new Date(), "LLLL yyyy")}
        </div>

        <button
          type="button"
          onClick={() => goToMonth?.(nextMonth)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronRight />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <CalendarIcon className="text-primary" />
          Outfit Calendar
        </h1>
        <p className="text-muted-foreground">Plan your looks for the week ahead.</p>
      </div>

      {/* Calendar + Preview */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <Card className="flex-1">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              captionLayout="label"
              className="w-full"
              components={{
                CaptionLabel: CustomCaption,
                Day: (props: any) => {
                  // DayPicker places this component inside a table row (<tr>).
                  // Return a <td> to keep valid HTML nesting, and wrap layout inside a <div>.
                  const { date, ...dayProps } = props;

                  // invalid date -> render empty cell
                  if (!(date instanceof Date) || isNaN(date.getTime())) {
                    return (
                      <td {...dayProps}>
                        <div className="relative h-full w-full flex items-center justify-center">
                          <span className="text-muted-foreground"> </span>
                        </div>
                      </td>
                    );
                  }

                  const outfit = getOutfitForDate(date);
                  return (
                    <td {...dayProps}>
                      <div className="relative h-full w-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        {outfit?.items?.[0] && (
                          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full overflow-hidden border border-primary">
                            <Image
                              src={outfit.items[0].imageUrl}
                              alt={outfit.items[0].name}
                              width={20}
                              height={20}
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  );
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Selected Outfit Preview */}
        <Card className="w-full lg:w-[60%]">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-center lg:text-center">
              {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
            </h3>
            {selectedDate && getOutfitForDate(selectedDate) ? (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {getOutfitForDate(selectedDate)?.items.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded overflow-hidden border"
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getOutfitForDate(selectedDate)?.name}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm text-center">
                No outfit planned for this day.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Outfit Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Plan outfit for {selectedDate ? format(selectedDate, "PPP") : "a selected day"}
            </DialogTitle>
            <DialogDescription>
              Select one of your saved outfits for this day.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] my-4 pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="cursor-pointer"
                  onClick={() => handleSelectOutfit(outfit.id)}
                >
                  <Card className="group overflow-hidden">
                    <div className="grid grid-cols-2 grid-rows-1 aspect-video bg-secondary">
                      {outfit.items.slice(0, 4).map((item: import('../../../lib/types').ClothingItem) => (
                          <div key={item.id} className="relative overflow-hidden border-2 border-background">
                            {(() => {
                              const aiHint = (item as any)['data-ai-hint'] as string | undefined;
                              return (
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  width={200}
                                  height={200}
                                  // pass data attribute safely
                                  {...(aiHint ? { ['data-ai-hint']: aiHint } : {})}
                                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                />
                              );
                            })()}
                          </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 aspect-video bg-secondary">
                      {outfit.items.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="relative border-2 border-background"
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={100}
                            height={100}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t">
                      <h4 className="text-sm font-semibold truncate">
                        {outfit.name}
                      </h4>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
