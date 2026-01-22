"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const zod_to_json_schema_1 = require("zod-to-json-schema");
const types_1 = require("../types");
const schemas = {
    // Request Schemas
    CreateChallenge: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.createChallengeSchema, { target: 'openApi3' }),
    CreateCompletion: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.createCompletionSchema, { target: 'openApi3' }),
    CreateFlag: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.createFlagSchema, { target: 'openApi3' }),
    UpdateUser: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.updateUserSchema, { target: 'openApi3' }),
    QueryParams: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.queryParamsSchema, { target: 'openApi3' }),
    NearbyChallengesQuery: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.nearbyChallengesQuerySchema, { target: 'openApi3' }),
    // Response Schemas
    User: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.userSchema, { target: 'openApi3' }),
    UserProfile: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.userProfileSchema, { target: 'openApi3' }),
    Challenge: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.challengeSchema, { target: 'openApi3' }),
    ChallengeWithCompletions: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.challengeWithCompletionsSchema, { target: 'openApi3' }),
    ChallengeWithDistance: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.challengeWithDistanceSchema, { target: 'openApi3' }),
    ChallengeCompletion: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.challengeCompletionSchema, { target: 'openApi3' }),
    Flag: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.flagSchema, { target: 'openApi3' }),
    LeaderboardEntry: (0, zod_to_json_schema_1.zodToJsonSchema)(types_1.leaderboardEntrySchema, { target: 'openApi3' }),
};
const options = {
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
exports.specs = (0, swagger_jsdoc_1.default)(options);
