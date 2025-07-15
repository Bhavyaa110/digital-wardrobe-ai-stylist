"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWardrobe } from '../../../context/WardrobeContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useToast } from '../../../hooks/use-toast';
import { generateOutfitSuggestions } from '../../../ai/flows/generate-outfit-suggestions';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import Image from 'next/image';
import type { Outfit } from '../../../lib/types';
import { Badge } from '../../../components/ui/badge';
import { Checkbox } from "../../../components/ui/checkbox"

const formSchema = z.object({
  occasion: z.string().min(1, 'Occasion is required'),
  styleTags: z.array(z.string()).optional(),
  moodTags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function GeneratePage() {
  const { clothingItems, createOutfit, weatherInfo, allStyleTags, allMoodTags } = useWardrobe();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{outfitSuggestions: string[], reasoning: string} | null>(null);

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { occasion: '', styleTags: [], moodTags: [] },
  });

  const selectedStyleTags = watch('styleTags') || [];
  const selectedMoodTags = watch('moodTags') || [];

  const onSubmit = async (data: FormValues) => {
    if (!weatherInfo) {
        toast({ variant: 'destructive', title: 'Weather Info Missing', description: 'Could not get weather data. Please try again.' });
        return;
    }
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await generateOutfitSuggestions({
        ...data,
        weather: `${weatherInfo.weather}, ${weatherInfo.temperature.toFixed(0)}°F`,
        closetItems: clothingItems.map(item => item.name),
        userStyle: "chic and modern", // This could be a user setting in the future
      });
      setSuggestions(result);
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate suggestions. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const findItemsForSuggestion = (suggestion: string) => {
    return clothingItems.filter(item => suggestion.toLowerCase().includes(item.name.toLowerCase()));
  }

  const handleSaveOutfit = (suggestion: string, items: any) => {
    createOutfit({
        name: suggestion,
        occasion: 'Casual', // This should be derived from the form
        items: items,
    });
    toast({ title: 'Outfit Saved!', description: `${suggestion} has been added to your outfits.` });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><Sparkles className="text-primary"/>AI Stylist</h1>
        <p className="text-muted-foreground">Tell me about your day, and I'll create the perfect outfit for you.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>What's the plan?</CardTitle>
              <CardDescription>Provide some details for personalized suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="occasion">Occasion</Label>
                    <Controller name="occasion" control={control} render={({ field }) => <Input {...field} id="occasion" placeholder="e.g., Brunch with friends" />} />
                </div>
                
                <div className="space-y-4">
                    <Label>What's your style today?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {allStyleTags.map(tag => (
                            <div key={tag} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`style-${tag}`}
                                    checked={selectedStyleTags.includes(tag)}
                                    onCheckedChange={(checked) => {
                                        const currentTags = selectedStyleTags;
                                        const newTags = checked ? [...currentTags, tag] : currentTags.filter(t => t !== tag);
                                        setValue('styleTags', newTags);
                                    }}
                                />
                                <label htmlFor={`style-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {capitalize(tag)}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <Label>What's your mood?</Label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {allMoodTags.map(tag => (
                            <div key={tag} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`mood-${tag}`}
                                    checked={selectedMoodTags.includes(tag)}
                                    onCheckedChange={(checked) => {
                                        const currentTags = selectedMoodTags;
                                        const newTags = checked ? [...currentTags, tag] : currentTags.filter(t => t !== tag);
                                        setValue('moodTags', newTags);
                                    }}
                                />
                                <label htmlFor={`mood-${tag}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {capitalize(tag)}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                    Generate Outfits
                </Button>
            </CardFooter>
        </form>
      </Card>

      {isLoading && <div className="text-center p-10"><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /> <p className="mt-4">Our AI is styling your look...</p></div>}
      
      {suggestions && (
        <div className="space-y-8">
            <div>
                 <h2 className="text-2xl font-bold font-headline">Here are your suggestions...</h2>
                 <p className="text-muted-foreground mt-2 border-l-4 border-primary pl-4">{suggestions.reasoning}</p>
            </div>
          
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestions.outfitSuggestions.map((suggestion, index) => {
                    const items = findItemsForSuggestion(suggestion);
                    return (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>{suggestion}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 aspect-square">
                                    {items.slice(0, 4).map(item => (
                                        <div key={item.id} className="bg-secondary rounded-md overflow-hidden">
                                            <Image src={item.imageUrl} alt={item.name} data-ai-hint={item['data-ai-hint']} width={150} height={150} className="w-full h-full object-cover"/>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full" onClick={() => handleSaveOutfit(suggestion, items)}>Save Outfit</Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
      )}

    </div>
  );
}
