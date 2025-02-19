import fs from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const filePath = path.join('/Users/tugan/Downloads/highlighter/output.jsonl');
    const entry = JSON.stringify(req.body) + '\n';

    fs.appendFileSync(filePath, entry);
    console.log(`New selection saved: ${entry.trim()}`);

    res.status(200).json({ message: 'Selection saved successfully' });
  } catch (error) {
    console.error('Error saving selection:', error);
    res.status(500).json({ message: 'Error saving selection' });
  }
}