export interface Profile { id: 'profile'; name: string; birthDate: string; lifespan: number; createdAt: string }
export interface Memory { id: string; date: string; title: string; description: string; emojis: string[]; category: string; color: string; photos: string[]; eventEndDate?: string; createdAt: string; updatedAt: string }
export interface Note { id: string; title: string; content: string; emoji: string; category: string; createdAt: string; updatedAt: string }
export interface Reminder { id: 'reminder'; enabled: boolean; time: string; message: string }
