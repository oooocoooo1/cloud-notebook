import { NextResponse } from 'next/server';
import { getNotebooks, createNotebook } from '@/lib/data';

export async function GET() {
    const notebooks = await getNotebooks();
    return NextResponse.json(notebooks);
}

export async function POST(request: Request) {
    try {
        const { name } = await request.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const newNotebook = await createNotebook(name);
        return NextResponse.json(newNotebook);
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
