type Course = {
    name: string;
    icon: string;
}

type Response = {
    code: number;
    message: string;
    data: any | undefined;
}
export type { Course, Response };