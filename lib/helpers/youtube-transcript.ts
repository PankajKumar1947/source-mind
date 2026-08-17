import { fetchTranscript } from 'youtube-transcript';

export function extractYoutubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    const isYoutubeDomain = 
      hostname === "youtube.com" || 
      hostname === "youtu.be" || 
      hostname.endsWith(".youtube.com") || 
      hostname.endsWith(".youtu.be");
                            
    if (!isYoutubeDomain) {
      return null;
    }
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  } catch {
    return null;
  }
}

export async function getYoutubeTranscript(videoId: string) {
  try {
    const transcript = await fetchTranscript(videoId);
    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return [];
  }
}