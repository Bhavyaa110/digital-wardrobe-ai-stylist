"use client";

import { useState } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Sparkles, Loader2, BookmarkCheck, Bookmark } from 'lucide-react';
import Image from 'next/image';
import type { ClothingItem, Occasion } from '../../../lib/types';
import { useToast } from '../../../hooks/use-toast';

export default function GeneratePage() {
  const { clothingItems, weatherInfo, createOutfit } = useWardrobe();
  const { toast } = useToast();
  const [occasion, setOccasion] = useState<Occasion | ''>('');
  const [suggestions, setSuggestions] = useState<ClothingItem[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!weatherInfo) {
      toast({ variant: 'destructive', title: 'Weather Info Missing', description: 'Please wait for weather data to load.' });
      return;
    }
    if (clothingItems.length < 2) {
      toast({ variant: 'destructive', title: 'Not Enough Items', description: 'Add at least 2 clothing items to your closet first.' });
      return;
    }
    if (!occasion) {
      toast({ variant: 'destructive', title: 'Missing Occasion', description: 'Please select an occasion.' });
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);
    setSavedIndexes(new Set());

    try {
      const response = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clothingItems, occasion, weather: weatherInfo }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate outfits');
      if (!data.outfits || data.outfits.length === 0) throw new Error('No outfit suggestions generated');

      setSuggestions(data.outfits);
      toast({ title: 'Success!', description: data.message });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setSuggestions([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (outfit: ClothingItem[], idx: number) => {
    setSavingIndex(idx);
    try {
      await createOutfit({
        name: `${occasion} Outfit ${idx + 1}`,
        occasion: occasion as Occasion,
        items: outfit,
        pinned: false,
      });
      setSavedIndexes(prev => new Set(prev).add(idx));
      toast({ title: 'Outfit Saved!', description: `${occasion} Outfit ${idx + 1} added to your outfits.` });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save outfit. Try again.' });
    } finally {
      setSavingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Sparkles className="text-primary" /> AI Stylist
        </h1>
        <p className="text-muted-foreground">Tell me about your day, and I'll create the perfect outfit for you.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>What's the plan?</CardTitle>
            <CardDescription>Select an occasion for personalized suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Occasion</Label>
              <Select value={occasion} onValueChange={(v) => setOccasion(v as Occasion)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Sporty">Sporty</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Party">Party</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} className="w-full" disabled={isGenerating || !weatherInfo || !occasion}>
              {isGenerating
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                : <><Sparkles className="mr-2 h-4 w-4" /> Generate Outfits</>
              }
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>AI Suggestions</CardTitle>
            <CardDescription>Like an outfit? Save it to your collection.</CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length > 0 ? (
              <div className="space-y-6">
                {suggestions.map((outfit, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Outfit {idx + 1}</h3>
                      <Button
                        size="sm"
                        variant={savedIndexes.has(idx) ? 'secondary' : 'default'}
                        disabled={savedIndexes.has(idx) || savingIndex === idx}
                        onClick={() => handleSave(outfit, idx)}
                      >
                        {savingIndex === idx ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                        ) : savedIndexes.has(idx) ? (
                          <><BookmarkCheck className="mr-2 h-4 w-4" /> Saved</>
                        ) : (
                          <><Bookmark className="mr-2 h-4 w-4" /> Save Outfit</>
                        )}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {outfit.map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="aspect-square rounded-md overflow-hidden bg-secondary">
                            <Image src={item.imageUrl} alt={item.name} width={150} height={150} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.color} · {item.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No suggestions yet</h3>
                <p className="text-muted-foreground mt-2">
                  {!weatherInfo ? 'Waiting for weather data...' : 'Select an occasion and click Generate.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}