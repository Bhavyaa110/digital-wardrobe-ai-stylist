"use client";

import { useState, useRef } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { PersonStanding, Loader2, Sparkles, Download, Zap, Brain, RefreshCw } from 'lucide-react';
import NextImage from 'next/image';
import { useToast } from '../../../hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';

export default function TryOnPage() {
  const { clothingItems } = useWardrobe();
  const { toast } = useToast();
  const [selectedTop, setSelectedTop] = useState('');
  const [selectedBottom, setSelectedBottom] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useCanvasMode, setUseCanvasMode] = useState(false);

  const tops = clothingItems.filter(item => item.category === 'Tops');
  const bottoms = clothingItems.filter(item => item.category === 'Bottoms');

  const selectedTopItem = clothingItems.find(item => item.id === selectedTop);
  const selectedBottomItem = clothingItems.find(item => item.id === selectedBottom);

  const generateCanvasPreview = () => {
    if (!selectedTopItem || !selectedBottomItem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600;
    canvas.height = 800;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#e0e7ff';
    ctx.beginPath();
    ctx.ellipse(300, 150, 80, 100, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillRect(220, 250, 160, 350);
    const topImg = new Image();
    topImg.crossOrigin = "anonymous";
    topImg.onload = () => {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(topImg, 150, 250, 300, 250);
      ctx.restore();
      const bottomImg = new Image();
      bottomImg.crossOrigin = "anonymous";
      bottomImg.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.drawImage(bottomImg, 150, 500, 300, 250);
        ctx.restore();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(selectedTopItem.name, 300, 530);
        ctx.fillText(selectedBottomItem.name, 300, 770);
        const imageUrl = canvas.toDataURL('image/png');
        setGeneratedImage(imageUrl);
        setIsGenerating(false);
      };
      bottomImg.src = selectedBottomItem.imageUrl;
    };
    topImg.src = selectedTopItem.imageUrl;
  };

  const handleGenerate = async () => {
    if (!selectedTop || !selectedBottom) {
      toast({ variant: 'destructive', title: 'Missing Items', description: 'Please select both a top and bottom.' });
      return;
    }
    setIsGenerating(true);
    setErrorMessage('');
    setGeneratedImage(null);
    if (useCanvasMode) {
      setTimeout(() => generateCanvasPreview(), 100);
      return;
    }
    try {
      const response = await fetch('/api/generate-tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topImage: selectedTopItem?.imageUrl,
          bottomImage: selectedBottomItem?.imageUrl,
          topName: selectedTopItem?.name,
          bottomName: selectedBottomItem?.name,
          topColor: selectedTopItem?.color,
          bottomColor: selectedBottomItem?.color,
          topFabric: selectedTopItem?.fabric,
          bottomFabric: selectedBottomItem?.fabric,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate try-on');
      setGeneratedImage(data.imageUrl);
      toast({ title: 'Success!', description: 'Your AI try-on is ready!' });
    } catch (error: any) {
      setErrorMessage(error.message);
      toast({ variant: 'destructive', title: 'Generation Failed', description: error.message });
      setUseCanvasMode(true);
      setTimeout(() => generateCanvasPreview(), 100);
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = selectedTop && selectedBottom;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <PersonStanding className="text-primary" />
            AI Virtual Try-On
          </h1>
          <p className="text-muted-foreground">See how your clothes look on a virtual model before you wear them.</p>
        </div>
        {/* Mode Toggle — pill style */}
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-full self-start sm:self-auto">
          <button
            onClick={() => setUseCanvasMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              !useCanvasMode ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Brain className="h-3.5 w-3.5" /> AI Mode
          </button>
          <button
            onClick={() => setUseCanvasMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              useCanvasMode ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="h-3.5 w-3.5" /> Instant
          </button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration Required</AlertTitle>
          <AlertDescription>
            {errorMessage.includes('HUGGINGFACE_API_TOKEN') || errorMessage.includes('not configured') ? (
              <div className="space-y-2">
                <p>{errorMessage}</p>
                <p className="text-xs mt-2">
                  To enable FREE AI try-on:
                  <br />1. Sign up at <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="underline">huggingface.co</a>
                  <br />2. Get your token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">Settings → Tokens</a>
                  <br />3. Add to .env.local as HUGGINGFACE_API_TOKEN
                  <br />4. Restart your dev server
                </p>
              </div>
            ) : errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6 items-start">

        {/* Left: Selection Panel */}
        <div className="space-y-4">

          {/* Top selector */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Top</Label>
                {selectedTopItem && (
                  <div className="flex gap-1">
                    {selectedTopItem.color && <Badge variant="outline" className="text-xs">{selectedTopItem.color}</Badge>}
                    {selectedTopItem.fabric && <Badge variant="outline" className="text-xs">{selectedTopItem.fabric}</Badge>}
                  </div>
                )}
              </div>
              <Select value={selectedTop} onValueChange={setSelectedTop}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a top from your closet" />
                </SelectTrigger>
                <SelectContent>
                  {tops.length > 0 ? tops.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  )) : (
                    <SelectItem value="none" disabled>No tops in your closet</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedTopItem && (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-14 h-14 rounded-md overflow-hidden border shrink-0">
                    <NextImage src={selectedTopItem.imageUrl} alt={selectedTopItem.name} width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{selectedTopItem.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{selectedTopItem.brand}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom selector */}
          <Card>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Bottom</Label>
                {selectedBottomItem && (
                  <div className="flex gap-1">
                    {selectedBottomItem.color && <Badge variant="outline" className="text-xs">{selectedBottomItem.color}</Badge>}
                    {selectedBottomItem.fabric && <Badge variant="outline" className="text-xs">{selectedBottomItem.fabric}</Badge>}
                  </div>
                )}
              </div>
              <Select value={selectedBottom} onValueChange={setSelectedBottom}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bottom from your closet" />
                </SelectTrigger>
                <SelectContent>
                  {bottoms.length > 0 ? bottoms.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                  )) : (
                    <SelectItem value="none" disabled>No bottoms in your closet</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {selectedBottomItem && (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="w-14 h-14 rounded-md overflow-hidden border shrink-0">
                    <NextImage src={selectedBottomItem.imageUrl} alt={selectedBottomItem.name} width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{selectedBottomItem.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{selectedBottomItem.brand}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            className="w-full h-12 text-base"
            disabled={!canGenerate || isGenerating}
          >
            {isGenerating ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{useCanvasMode ? 'Creating Preview...' : 'Generating AI Avatar...'}</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" />{useCanvasMode ? 'Create Instant Preview' : 'Generate AI Try-On'}</>
            )}
          </Button>

          {!canGenerate && (
            <p className="text-xs text-muted-foreground text-center">Select a top and bottom to continue</p>
          )}
        </div>

        {/* Right: Preview Panel */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {useCanvasMode ? 'Instant composite preview' : 'AI-generated virtual model'}
                </CardDescription>
              </div>
              {generatedImage && (
                <Badge variant="secondary" className="text-xs">
                  {useCanvasMode ? '⚡ Instant' : '✨ AI Generated'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedImage ? (
              <div className="space-y-3">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-secondary border">
                  <NextImage src={generatedImage} alt="AI Try-on Preview" fill className="object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setGeneratedImage(null); }}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={generatedImage} download="fitzy-tryon.png" target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" /> Download
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center aspect-[3/4] bg-secondary/50 rounded-xl border-2 border-dashed">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <PersonStanding className="h-20 w-20 text-muted-foreground" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">
                        {useCanvasMode ? 'Building your preview...' : 'AI is styling your avatar...'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {useCanvasMode ? 'Just a second' : 'This may take 15–30 seconds'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <div className="p-4 rounded-full bg-secondary">
                      <PersonStanding className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Your look will appear here</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {!canGenerate
                          ? 'Select a top and bottom to get started'
                          : `Click "Generate" to see your ${useCanvasMode ? 'preview' : 'AI try-on'}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}