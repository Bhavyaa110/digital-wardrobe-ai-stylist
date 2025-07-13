export async function clothingItemBackgroundRemoval(input: { photoDataUri: string }) {
    // Return the original image to avoid breaking UI during static export
    return {
      processedPhotoDataUri: input.photoDataUri,
    };
  }
  