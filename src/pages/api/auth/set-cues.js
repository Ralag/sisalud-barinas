import { serialize } from 'cookie';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { cuesId } = req.body;

    if (!cuesId) {
        return res.status(400).json({ message: 'CUES ID is required' });
    }

    res.setHeader('Set-Cookie', serialize('active_cues', cuesId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    }));

    return res.status(200).json({ success: true });
}
