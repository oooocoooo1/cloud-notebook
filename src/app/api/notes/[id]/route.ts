import { NextResponse } from 'next/server';
import { updateNote, deleteNote } from '@/lib/data';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Remove id from body if present to avoid overwriting immutable id (though logic handles it)
        const { id: _, ...updates } = body;

        const updatedNote = await updateNote(id, updates);
        if (!updatedNote) {
            return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        }

        return NextResponse.json(updatedNote);
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await deleteNote(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
