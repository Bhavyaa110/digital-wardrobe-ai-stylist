import { ClothingList } from "@/components/closet/ClothingList";

export default function ClosetPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold font-headline">My Closet</h1>
        <p className="text-muted-foreground">Browse, filter, and manage all your clothing items.</p>
      </div>
      <ClothingList />
    </div>
  );
}
