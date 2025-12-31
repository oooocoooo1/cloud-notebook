import { prisma } from './prisma';
import { Notebook, Note } from './types';

// Notebook Operations
export async function getNotebooks(): Promise<Notebook[]> {
    const notebooks = await prisma.notebook.findMany({
        orderBy: { createdAt: 'asc' }
    });
    // Prisma Dates are Date objects, need serializing if passed directly to client components without mapping, 
    // but Next 13+ Server Components handle it mostly well, though safest to return plain objects or strings if we strictly follow the interface
    // The interface defines createdAt as string. Prisma returns Date.
    return notebooks.map(nb => ({
        ...nb,
        createdAt: nb.createdAt.toISOString()
    }));
}

export async function createNotebook(name: string): Promise<Notebook> {
    const nb = await prisma.notebook.create({
        data: { name }
    });
    return {
        ...nb,
        createdAt: nb.createdAt.toISOString()
    };
}

// Note Operations
export async function getNotes(notebookId?: string): Promise<Note[]> {
    const where = notebookId ? { notebookId } : {};
    const notes = await prisma.note.findMany({
        where,
        orderBy: { updatedAt: 'desc' }
    });
    return notes.map(n => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString()
    }));
}

export async function createNote(notebookId: string, title?: string, content?: string): Promise<Note> {
    const note = await prisma.note.create({
        data: {
            notebookId,
            title: title || '无标题笔记',
            content: content || ''
        }
    });
    return {
        ...note,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString()
    };
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    try {
        // Separate metadata that shouldn't be manually updated or need casting
        const { id: _, createdAt: __, updatedAt: ___, ...data } = updates;

        const note = await prisma.note.update({
            where: { id },
            data: data
        });
        return {
            ...note,
            createdAt: note.createdAt.toISOString(),
            updatedAt: note.updatedAt.toISOString()
        };
    } catch (e) {
        return null;
    }
}

export async function deleteNote(id: string): Promise<void> {
    try {
        await prisma.note.delete({ where: { id } });
    } catch (e) {
        // Ignore if already deleted
    }
}
