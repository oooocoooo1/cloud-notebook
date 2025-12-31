import { NextResponse } from 'next/server';
import { createNote, getNotebooks, createNotebook } from '@/lib/data';

export async function POST(request: Request) {
    try {
        const textData = await request.text();
        let content = '';
        let title = '';
        let notebookId = '';

        // Try to parse JSON, if fails, treat as raw text
        try {
            const json = JSON.parse(textData);
            content = json.text || json.content || json.selection || '';
            title = json.title || '';
            notebookId = json.notebookId || '';
        } catch (e) {
            content = textData;
        }

        if (!content) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        // If no notebookId provided, or it's 'default', find the first available notebook
        if (!notebookId || notebookId === 'default') {
            const notebooks = await getNotebooks();
            if (notebooks.length > 0) {
                notebookId = notebooks[0].id;
            } else {
                // Fallback: create a new one if somehow none exist
                const newNb = await createNotebook('我的笔记本');
                notebookId = newNb.id;
            }
        }

        if (!title) {
            // Generate title from first 30 chars
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
