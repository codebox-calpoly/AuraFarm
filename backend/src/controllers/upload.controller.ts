import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../middleware/errorHandler';
import { supabase } from '../supabase';

const BUCKET = 'completion-images';

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  const file = req.file;
  if (!file) {
    throw new AppError('No image file provided', 400);
  }

  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
  };
  const ext = mimeToExt[file.mimetype] || file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${req.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new AppError(`Image upload failed: ${error.message}`, 500);
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  res.json({
    success: true,
    data: { imageUrl: urlData.publicUrl },
  });
});
