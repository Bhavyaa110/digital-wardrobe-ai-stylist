"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWardrobe } from '@/context/WardrobeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { clothingItemBackgroundRemoval } from '@/ai/flows/clothing-item-background-removal';
import { tagClothingItem } from '@/ai/flows/tag-clothing-item';
import { Loader2, UploadCloud, Wand2, Camera, FlipHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import type { Category, Occasion, Season } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories']),
  color: z.string().min(1, 'Color is required'),
  brand: z.string().min(1, 'Brand is required'),
  season: z.enum(['Spring', 'Summer', 'Autumn', 'Winter', 'All-Season']),
  fabric: z.string().min(1, 'Fabric is required'),
  occasion: z.enum(['Casual', 'Formal', 'Sporty', 'Work', 'Party']),
});

type FormValues = z.infer<typeof formSchema>;

interface AddClothingItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClothingItemForm({ open, onOpenChange }: AddClothingItemFormProps) {
  const { addClothingItem } = useWardrobe();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraMirrored, setIsCameraMirrored] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category: 'Tops',
      color: '',
      brand: '',
      season: 'All-Season',
      fabric: '',
      occasion: 'Casual',
    },
  });

  useEffect(() => {
    if(open) {
      const getCameraPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setHasCameraPermission(false);
            return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    } else {
        // Stop camera stream when sheet is closed
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }
  }, [open]);

  const processImage = async (dataUri: string) => {
    setIsLoading(true);
    setProcessedImage(null);
    setStyleTags([]);
    setMoodTags([]);
    setImagePreview(dataUri);
    try {
      setLoadingStep('Removing background...');
      const bgRemovalResult = await clothingItemBackgroundRemoval({ photoDataUri: dataUri });
      const processedUri = bgRemovalResult.processedPhotoDataUri;
      setProcessedImage(processedUri);

      setLoadingStep('Analyzing style...');
      const tagResult = await tagClothingItem({ photoDataUri: processedUri, description: 'a piece of clothing' });
      setStyleTags(tagResult.styleTags);
      setMoodTags(tagResult.moodTags);
    } catch (error) {
      console.error('AI processing failed:', error);
      toast({ variant: 'destructive', title: 'AI Processing Error', description: 'Could not process the image. Please try another one.' });
      setProcessedImage(dataUri); // Fallback to original image
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        await processImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            if (isCameraMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/png');
            await processImage(dataUri);
        }
    }
  }

  const onSubmit = (data: FormValues) => {
    if (!processedImage && !imagePreview) {
      toast({ variant: 'destructive', title: 'Missing Image', description: 'Please upload an image for the clothing item.' });
      return;
    }
    
    addClothingItem({
      ...data,
      imageUrl: processedImage || imagePreview!,
      styleTags,
      moodTags,
    });
    
    toast({ title: 'Item Added!', description: `${data.name} has been added to your closet.` });
    handleClose();
  };

  const handleClose = () => {
    reset();
    setImagePreview(null);
    setProcessedImage(null);
    setStyleTags([]);
    setMoodTags([]);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Add a New Clothing Item</SheetTitle>
          <SheetDescription>Upload a picture or use your camera to add a new item.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="space-y-2">
                <Label>Image</Label>
                <Tabs defaultValue="upload">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4"/> Upload</TabsTrigger>
                        <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4"/> Camera</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload">
                        <div className="relative border-2 border-dashed border-muted rounded-lg p-4 text-center aspect-square flex flex-col items-center justify-center">
                            {(imagePreview || processedImage) ? (
                                <Image src={processedImage || imagePreview || ''} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" />
                            ) : (
                                <div className="space-y-2">
                                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">Click to upload or drag & drop</p>
                                </div>
                            )}
                            {isLoading && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm font-medium text-primary">{loadingStep}</p>
                                </div>
                            )}
                            <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                    </TabsContent>
                    <TabsContent value="camera">
                        <div className="relative border-2 border-dashed border-muted rounded-lg p-4 text-center aspect-square flex flex-col items-center justify-center overflow-hidden">
                             {(imagePreview || processedImage) ? (
                                <Image src={processedImage || imagePreview || ''} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" />
                            ) : hasCameraPermission === null ? (
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            ) : hasCameraPermission ? (
                                <video ref={videoRef} className={cn("absolute inset-0 w-full h-full object-cover", isCameraMirrored && "transform -scale-x-100")} autoPlay muted playsInline />
                            ) : (
                                <Alert variant="destructive">
                                    <AlertTitle>Camera Access Denied</AlertTitle>
                                    <AlertDescription>
                                        Please enable camera permissions in your browser settings to use this feature.
                                    </AlertDescription>
                                </Alert>
                            )}
                             {isLoading && (
                                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm font-medium text-primary">{loadingStep}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex justify-center gap-2">
                            <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission || isLoading}>
                                <Camera className="mr-2 h-4 w-4"/> Capture
                            </Button>
                            <Button type="button" variant="outline" size="icon" onClick={() => setIsCameraMirrored(p => !p)} disabled={!hasCameraPermission || isLoading}>
                                <FlipHorizontal className="h-4 w-4"/>
                            </Button>
                        </div>
                         <canvas ref={canvasRef} className="hidden" />
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-2">
                <Label>Name</Label>
                <Controller name="name" control={control} render={({ field }) => <Input {...field} placeholder="e.g., Classic White Tee" />} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Controller name="category" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tops">Tops</SelectItem>
                                <SelectItem value="Bottoms">Bottoms</SelectItem>
                                <SelectItem value="Outerwear">Outerwear</SelectItem>
                                <SelectItem value="Footwear">Footwear</SelectItem>
                                <SelectItem value="Accessories">Accessories</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                </div>
                <div className="space-y-2">
                    <Label>Color</Label>
                    <Controller name="color" control={control} render={({ field }) => <Input {...field} placeholder="e.g., White" />} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Brand</Label>
                    <Controller name="brand" control={control} render={({ field }) => <Input {...field} placeholder="e.g., Everlane" />} />
                </div>
                <div className="space-y-2">
                    <Label>Fabric</Label>
                    <Controller name="fabric" control={control} render={({ field }) => <Input {...field} placeholder="e.g., Cotton" />} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Season</Label>
                    <Controller name="season" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All-Season">All-Season</SelectItem>
                                <SelectItem value="Spring">Spring</SelectItem>
                                <SelectItem value="Summer">Summer</SelectItem>
                                <SelectItem value="Autumn">Autumn</SelectItem>
                                <SelectItem value="Winter">Winter</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                </div>
                <div className="space-y-2">
                    <Label>Occasion</Label>
                    <Controller name="occasion" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger><SelectValue placeholder="Select occasion" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Casual">Casual</SelectItem>
                                <SelectItem value="Formal">Formal</SelectItem>
                                <SelectItem value="Sporty">Sporty</SelectItem>
                                <SelectItem value="Work">Work</SelectItem>
                                <SelectItem value="Party">Party</SelectItem>
                            </SelectContent>
                        </Select>
                    )} />
                </div>
            </div>
            
             {(styleTags.length > 0 || moodTags.length > 0) && (
                <div className="space-y-4 rounded-lg border bg-secondary/50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium"><Wand2 className="h-4 w-4 text-primary"/> AI Generated Tags</div>
                    {styleTags.length > 0 && <div className="space-y-2">
                        <Label className="text-xs">Style Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {styleTags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                        </div>
                    </div>}
                     {moodTags.length > 0 && <div className="space-y-2">
                        <Label className="text-xs">Mood Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {moodTags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                        </div>
                    </div>}
                </div>
            )}
        </form>
        </ScrollArea>
        <SheetFooter className="pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>Save Item</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
