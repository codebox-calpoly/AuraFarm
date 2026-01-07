import { Router } from 'express';
import {
  completeChallenge,
  getCompletionById,
  getCompletions,
} from '../controllers/completions.controller';
import { validateBody, validate } from '../middleware/validate';
import { validateParams } from '../middleware/validateParams';
import {
  createCompletionSchema,
  completionIdParamSchema,
  completionsListQuerySchema,
} from '../types';

const router = Router();

router.post(
  '/',
  validateBody(createCompletionSchema),
  completeChallenge
);

router.get(
  '/',
  validate(completionsListQuerySchema),
  getCompletions
);

router.get(
  '/:id',
  validateParams(completionIdParamSchema),
  getCompletionById
);

export default router;
