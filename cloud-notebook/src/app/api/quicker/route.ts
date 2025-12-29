import { NextResponse } from 'next/server';
import { createNote, getNotebooks } from '@/lib/data';

export async function POST(request: Request) {
    try {
        const textData = await request.text();
        let content = '';
        let title = '';
        let notebookId = 'default';

        // Try to parse JSON, if fails, treat as raw text
        try {
            const json = JSON.parse(textData);
            content = json.text || json.content || json.selection || '';
            title = json.title || '';
            notebookId = json.notebookId || 'default';
        } catch (e) {
            content = textData;
        }

        if (!content) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        if (!title) {
            // Generate title from first 20 chars
            title = content.substring(0, 30).split('\n')[0] || 'Quicker Note';
        }

        const newNote = await createNote(notebookId, title, content);

        return NextResponse.json({ success: true, note: newNote }, {
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow Quicker to POST from anywhere
                'Access-Control-Allow-Methods': 'POST',
            }
        });

    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error', details: String(e) }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
