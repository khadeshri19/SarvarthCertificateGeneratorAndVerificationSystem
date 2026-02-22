export interface User {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: 'admin' | 'user';
    created_at?: Date;
}

export interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'user';
    };
}
