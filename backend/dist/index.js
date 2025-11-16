"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
// Import routes
const challenges_routes_1 = __importDefault(require("./routes/challenges.routes"));
const completions_routes_1 = __importDefault(require("./routes/completions.routes"));
const flags_routes_1 = __importDefault(require("./routes/flags.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(requestLogger_1.requestLogger);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/challenges', challenges_routes_1.default);
app.use('/api/completions', completions_routes_1.default);
app.use('/api/flags', flags_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/leaderboard', leaderboard_routes_1.default);
// 404 handler for undefined routes
app.use(errorHandler_1.notFoundHandler);
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API endpoints available at: http://localhost:${PORT}/api`);
});
