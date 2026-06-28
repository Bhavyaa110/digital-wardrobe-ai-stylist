"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWardrobe } from '../../context/WardrobeContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../../components/ui/sheet';
import { ScrollArea } from '../../components/ui/scroll-area';
import { useToast } from '../../hooks/use-toast';
import { clothingItemBackgroundRemoval } from '../../ai/flows/clothing-item-background-removal';
import { Loader2, UploadCloud, Camera, FlipHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { cn } from '../../lib/utils';

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
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraMirrored, setIsCameraMirrored] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { control, handleSubmit, reset } = useForm<FormValues>({
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
    if (open) {
      const getCameraPermission = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
          setHasCameraPermission(false);
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch {
          setHasCameraPermission(false);
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [open]);

  const processImage = async (dataUri: string) => {
    setIsLoading(true);
    setProcessedImage(null);
    setImagePreview(dataUri);
    try {
      setLoadingStep('Removing background...');
      const result = await clothingItemBackgroundRemoval({ photoDataUri: dataUri });
      setProcessedImage(result.processedPhotoDataUri);
    } catch {
      toast({ title: 'Background removal unavailable', description: 'Using original image.' });
      setProcessedImage(dataUri);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => await processImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (isCameraMirrored) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    await processImage(canvas.toDataURL('image/png'));
  };

  const onSubmit = async (data: FormValues) => {
    if (!processedImage && !imagePreview) {
      toast({ variant: 'destructive', title: 'Missing Image', description: 'Please upload an image.' });
      return;
    }
    try {
      await addClothingItem({
        name: data.name,
        category: data.category,
        color: data.color,
        brand: data.brand,
        season: data.season,
        fabric: data.fabric,
        occasion: data.occasion,
        imageUrl: processedImage || imagePreview || '',
        'data-ai-hint': `A ${data.color} ${data.fabric} ${data.category.toLowerCase()} from ${data.brand}, suitable for ${data.occasion.toLowerCase()} occasions in ${data.season}`,
      });
      toast({ title: 'Item Added!', description: `${data.name} has been added to your closet.` });
      handleClose();
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add item. Please try again.' });
    }
  };

  const handleClose = () => {
    reset();
    setImagePreview(null);
    setProcessedImage(null);
    onOpenChange(false);
  };

  const previewSrc = processedImage || imagePreview || '';

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
                  <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4" /> Upload</TabsTrigger>
                  <TabsTrigger value="camera"><Camera className="mr-2 h-4 w-4" /> Camera</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <div className="relative border-2 border-dashed border-muted rounded-lg p-4 text-center aspect-square flex flex-col items-center justify-center">
                    {previewSrc ? (
                      <Image src={previewSrc} alt="Preview" fill className="object-contain rounded-md" />
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
                    {previewSrc ? (
                      <Image src={previewSrc} alt="Preview" fill className="object-contain rounded-md" />
                    ) : hasCameraPermission === null ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : hasCameraPermission ? (
                      <video ref={videoRef} className={cn("absolute inset-0 w-full h-full object-cover", isCameraMirrored && "scale-x-[-1]")} autoPlay muted playsInline />
                    ) : (
                      <Alert variant="destructive">
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>Enable camera permissions in your browser settings.</AlertDescription>
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
                      <Camera className="mr-2 h-4 w-4" /> Capture
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsCameraMirrored(p => !p)} disabled={!hasCameraPermission || isLoading}>
                      <FlipHorizontal className="h-4 w-4" />
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
          </form>
        </ScrollArea>
        <SheetFooter className="pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
          <Button type="button" onClick={handleSubmit(onSubmit)}>Save Item</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}