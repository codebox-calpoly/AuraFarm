"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAuth = exports.supabase = exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Ensure .env is loaded from the root directory if not already
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '..', '..', '.env') });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration. Please check your .env file (should be in the root directory):\n' +
        '  - SUPABASE_URL\n' +
        '  - SUPABASE_SERVICE_KEY\n' +
        '  - SUPABASE_ANON_KEY');
}
// Admin client — for server-side operations that bypass RLS
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
// Public client — for user-facing operations (auth, storage with RLS, etc.)
// Uses anon key by default; will use service key if anon key is missing (backwards compatibility)
const publicAuthKey = supabaseAnonKey || supabaseServiceKey;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, publicAuthKey);
// Keeping this as an alias for now to avoid breaking existing imports that use this name
exports.supabaseAuth = exports.supabase;
