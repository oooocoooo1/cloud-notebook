import { NextResponse } from 'next/server';
import { getNotes, createNote } from '@/lib/data';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const notebookId = searchParams.get('notebookId');

    const notes = await getNotes(notebookId || undefined);
    return NextResponse.json(notes);
}

export async function POST(request: Request) {
    try {
        const { notebookId, title, content } = await request.json();
        if (!notebookId) return NextResponse.json({ error: 'Notebook ID is required' }, { status: 400 });

        const newNote = await createNote(notebookId, title, content);
        return NextResponse.json(newNote);
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
