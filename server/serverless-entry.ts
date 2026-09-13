import app from './app';

// Vercel Serverless Function handler
export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}

export { app };
