const API_URL = import.meta.env.VITE_API_URL;

export function getImageUrl(image) {
  if (!image) {
    return 'https://placehold.co/400x300/e5e7eb/9ca3af?text=Sin+imagen';
  }

  // Si ya viene con URL completa, la devuelve directamente
  if (image.startsWith('http')) {
    return image;
  }

  return `${API_URL}/uploads/${image}`;
}