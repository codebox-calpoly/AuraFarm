import { Router } from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelOutgoingRequest,
  removeFriend,
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
} from '../controllers/friends.controller';
import { validateBody } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { friendRequestBodySchema, friendRequesterBodySchema } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', listFriends);
router.get('/incoming', listIncomingRequests);
router.get('/outgoing', listOutgoingRequests);

router.post('/request', validateBody(friendRequestBodySchema), sendFriendRequest);
router.post('/accept', validateBody(friendRequesterBodySchema), acceptFriendRequest);
router.post('/decline', validateBody(friendRequesterBodySchema), declineFriendRequest);

router.delete('/outgoing/:targetUserId', cancelOutgoingRequest);
router.delete('/:userId', removeFriend);

export default router;
