import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';
import { prisma } from '../prisma';
import { AppError } from './errorHandler';
import { asyncHandler } from './asyncHandler';