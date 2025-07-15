"use client";

import { useState } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useToast } from '../../../hooks/use-toast';
import { aiAvatarTryOn } from '../../../ai/flows/ai-avatar-try-on';
import { Loader2, PersonStanding, Sparkles } from 'lucide-react';
import Image from 'next/image';
import type { ClothingItem } from '../../../lib/types';

export default function TryOnPage() {
  const { clothingItems } = useWardrobe();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const [selectedTopId, setSelectedTopId] = useState<string | null>(null);
  const [selectedBottomId, setSelectedBottomId] = useState<string | null>(null);

  const avatarDataUri = "https://placehold.co/400x600.png";

  const tops = clothingItems.filter(item => item.category === 'Tops');
  const bottoms = clothingItems.filter(item => item.category === 'Bottoms');

  const selectedTop = clothingItems.find(item => item.id === selectedTopId);
  const selectedBottom = clothingItems.find(item => item.id === selectedBottomId);

  const handleGenerate = async () => {
    if (!selectedTop || !selectedBottom) {
      toast({
        variant: 'destructive',
        title: 'Selection incomplete',
        description: 'Please select both a top and a bottom.',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedAvatar(null);
    try {
      // NOTE: This assumes imageUrls are data URIs, which is true for uploaded items
      // but not for initial seed data with placehold.co URLs.
      // A production app would need to handle fetching and converting URLs to data URIs.
      const result = await aiAvatarTryOn({
        avatarDataUri: avatarDataUri,
        topDataUri: selectedTop.imageUrl,
        bottomDataUri: selectedBottom.imageUrl,
      });
      setGeneratedAvatar(result.generatedAvatarDataUri);
    } catch (error) {
      console.error('AI try-on failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate the preview. The item images might not be compatible. Please try with user-uploaded items.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <PersonStanding className="text-primary" /> AI Try-On
        </h1>
        <p className="text-muted-foreground">
          Visualize your outfits on an AI avatar.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Select Your Outfit</CardTitle>
              <CardDescription>
                Choose a top and bottom from your closet.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Select onValueChange={setSelectedTopId} value={selectedTopId ?? undefined}>
                  <SelectTrigger><SelectValue placeholder="Select a Top" /></SelectTrigger>
                  <SelectContent>
                    {tops.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Card className="aspect-square flex items-center justify-center bg-secondary">
                  {selectedTop ? (
                    <Image src={selectedTop.imageUrl} alt={selectedTop.name} width={300} height={300} className="object-contain max-h-full max-w-full rounded-md" />
                  ) : <p className="text-muted-foreground">Top preview</p>}
                </Card>
              </div>
              <div className="space-y-2">
                 <Select onValueChange={setSelectedBottomId} value={selectedBottomId ?? undefined}>
                  <SelectTrigger><SelectValue placeholder="Select a Bottom" /></SelectTrigger>
                  <SelectContent>
                    {bottoms.map(item => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <Card className="aspect-square flex items-center justify-center bg-secondary">
                  {selectedBottom ? (
                    <Image src={selectedBottom.imageUrl} alt={selectedBottom.name} width={300} height={300} className="object-contain max-h-full max-w-full rounded-md" />
                  ) : <p className="text-muted-foreground">Bottom preview</p>}
                </Card>
              </div>
            </CardContent>
          </Card>
           <Button onClick={handleGenerate} disabled={isLoading || !selectedTop || !selectedBottom} size="lg" className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate Preview
          </Button>
        </div>

        <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-center">Your Avatar</h2>
             <Card className="aspect-[3/4] flex items-center justify-center bg-secondary overflow-hidden">
                {isLoading ? (
                     <div className="text-center p-4 flex flex-col items-center justify-center">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /> 
                        <p className="mt-4 text-sm">Dressing up...</p>
                    </div>
                ) : generatedAvatar ? (
                    <Image src={generatedAvatar} alt="Generated Avatar Preview" width={400} height={600} className="object-cover w-full h-full" />
                ) : (
                    <Image src={avatarDataUri} alt="Avatar" width={400} height={600} data-ai-hint="fashion model" className="object-cover w-full h-full opacity-70" />
                )}
             </Card>
        </div>
      </div>
    </div>
  );
}
