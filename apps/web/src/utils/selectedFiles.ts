export default function selectedFiles(e: any): File[] {
    if (e && e.target.files) {
      return Array.from(e.target.files); // Always return an array
    }
    return [];
  }
  