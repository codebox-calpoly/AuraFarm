import swaggerJsdoc from 'swagger-jsdoc';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
    createChallengeSchema,
    createCompletionSchema,
    createFlagSchema,
    updateUserSchema,
    queryParamsSchema,
    nearbyChallengesQuerySchema,
    idParamSchema,
    userIdParamSchema,
    challengeIdParamSchema,
    completionIdParamSchema,
    userSchema,
    userProfileSchema,
    challengeSchema,
    challengeWithCompletionsSchema,
    challengeWithDistanceSchema,
    challengeCompletionSchema,
    flagSchema,
    leaderboardEntrySchema,
} from '../types';

const schemas = {
    // Request Schemas
    CreateChallenge: zodToJsonSchema(createChallengeSchema as any, { target: 'openApi3' }),
    CreateCompletion: zodToJsonSchema(createCompletionSchema as any, { target: 'openApi3' }),
    CreateFlag: zodToJsonSchema(createFlagSchema as any, { target: 'openApi3' }),
    UpdateUser: zodToJsonSchema(updateUserSchema as any, { target: 'openApi3' }),
    QueryParams: zodToJsonSchema(queryParamsSchema as any, { target: 'openApi3' }),
    NearbyChallengesQuery: zodToJsonSchema(nearbyChallengesQuerySchema as any, { target: 'openApi3' }),

    // Response Schemas
    User: zodToJsonSchema(userSchema as any, { target: 'openApi3' }),
    UserProfile: zodToJsonSchema(userProfileSchema as any, { target: 'openApi3' }),
    Challenge: zodToJsonSchema(challengeSchema as any, { target: 'openApi3' }),
    ChallengeWithCompletions: zodToJsonSchema(challengeWithCompletionsSchema as any, { target: 'openApi3' }),
    ChallengeWithDistance: zodToJsonSchema(challengeWithDistanceSchema as any, { target: 'openApi3' }),
    ChallengeCompletion: zodToJsonSchema(challengeCompletionSchema as any, { target: 'openApi3' }),
    Flag: zodToJsonSchema(flagSchema as any, { target: 'openApi3' }),
    LeaderboardEntry: zodToJsonSchema(leaderboardEntrySchema as any, { target: 'openApi3' }),
};

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AuraFarm API Documentation',
            version: '1.0.0',
            description: 'API documentation for AuraFarm backend service',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                ...schemas,
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        message: { type: 'string' }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                        message: { type: 'string' }
                    }
                }
            },
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
