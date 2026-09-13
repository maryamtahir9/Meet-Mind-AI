import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server/app';

// Vercel Serverless Function entry point
// Handles all /api/* requests routed through vercel.json
export default function handler(req: IncomingMessage, res: ServerResponse) {
  return app(req as any, res as any);
}
