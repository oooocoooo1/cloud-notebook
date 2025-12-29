export interface Notebook {
    id: string;
    name: string;
    createdAt: string;
}

export interface Note {
    id: string;
    notebookId: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}
