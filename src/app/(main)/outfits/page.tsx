"use client";

import { useState } from "react";
import { useWardrobe } from "../../../context/WardrobeContext";
import { Card, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pin, PinOff, Trash2, Pencil, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import type { Outfit, Occasion } from "../../../lib/types";
import { useToast } from "../../../hooks/use-toast";

export default function OutfitsPage() {
  const { outfits, updateOutfit, refreshOutfits } = useWardrobe();
  const { toast } = useToast();
  const [editingOutfit, setEditingOutfit] = useState<Outfit | null>(null);
  const [editName, setEditName] = useState('');
  const [editOccasion, setEditOccasion] = useState<Occasion>('Casual');
  const [isSaving, setIsSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEditOpen = (outfit: Outfit) => {
    setEditingOutfit(outfit);
    setEditName(outfit.name);
    setEditOccasion(outfit.occasion);
  };

  const handleEditSave = async () => {
    if (!editingOutfit || !editName.trim()) return;
    setIsSaving(true);
    try {
      await updateOutfit({ ...editingOutfit, name: editName.trim(), occasion: editOccasion });
      toast({ title: 'Outfit updated!' });
      setEditingOutfit(null);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to update outfit' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (outfit: Outfit) => {
    try {
      const token = localStorage.getItem('fitzy_token');
      await fetch(`/api/outfits?id=${outfit.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshOutfits();
      toast({ title: 'Outfit deleted' });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete outfit' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Outfits</h1>
          <p className="text-muted-foreground">All your saved looks in one place.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/mix-and-match">
            <Button><Plus className="mr-2 h-4 w-4" /> Create Outfit</Button>
          </Link>
          <Link href="/generate">
            <Button variant="secondary">AI Stylist</Button>
          </Link>
        </div>
      </div>

      {outfits.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="flex flex-col rounded-lg border bg-card shadow-sm">

              {/* Image grid */}
              <div className="grid grid-cols-2 grid-rows-2 aspect-square bg-secondary rounded-t-lg overflow-hidden">
                {outfit.items.slice(0, 4).map((item) => (
                  <div key={item.id} className="relative border-2 border-background overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
                {outfit.items.length < 4 &&
                  [...Array(4 - outfit.items.length)].map((_, i) => (
                    <div key={i} className="bg-secondary border-2 border-background" />
                  ))}
              </div>

              {/* Info + actions row */}
              <div className="relative p-4 border-t flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{outfit.name}</p>
                  <p className="text-sm text-muted-foreground">{outfit.occasion}</p>
                  {outfit.pinned && (
                    <p className="text-xs text-primary flex items-center gap-1 mt-1">
                      <Pin className="h-3 w-3" /> Pinned
                    </p>
                  )}
                </div>

                {/* Manual dropdown — no Radix */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === outfit.id ? null : outfit.id);
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {openMenuId === outfit.id && (
                    <>
                      {/* Backdrop to close on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpenMenuId(null)}
                      />
                      <div className="absolute right-0 top-9 z-50 min-w-[140px] rounded-md border bg-popover shadow-md p-1">
                        <button
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                          onClick={() => { handleEditOpen(outfit); setOpenMenuId(null); }}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                          onClick={() => { updateOutfit({ ...outfit, pinned: !outfit.pinned }); setOpenMenuId(null); }}
                        >
                          {outfit.pinned
                            ? <><PinOff className="h-4 w-4" /> Unpin</>
                            : <><Pin className="h-4 w-4" /> Pin to Home</>}
                        </button>
                        <button
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-destructive hover:bg-accent"
                          onClick={() => { handleDelete(outfit); setOpenMenuId(null); }}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <CardTitle>No Outfits Yet</CardTitle>
          <CardDescription className="mt-2">
            You haven't saved any outfits.<br />Let's create your first look!
          </CardDescription>
          <Link href="/mix-and-match" className="mt-4">
            <Button><Plus className="mr-2 h-4 w-4" /> Create an Outfit</Button>
          </Link>
        </Card>
      )}

      <Dialog open={!!editingOutfit} onOpenChange={(o) => !o && setEditingOutfit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Outfit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Outfit Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="e.g., Friday Night Look" />
            </div>
            <div className="space-y-2">
              <Label>Occasion</Label>
              <Select value={editOccasion} onValueChange={(v) => setEditOccasion(v as Occasion)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Button variant="outline" onClick={() => setEditingOutfit(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}