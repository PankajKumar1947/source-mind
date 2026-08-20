import { imagekit } from "@/lib/clients/imagekit";

export async function deleteImageKitFolder(folderPath: string) {
  if (!folderPath) throw new Error("Folder path is required");

  try {
    const result = await imagekit.deleteFolder(folderPath);
    console.log("Deleted ImageKit folder successfully:", result);
  } catch (error) {
    console.error("Failed to delete ImageKit folder:", error);
  }
}
