type Course = {
    grade: string // 年级
    department: string // 学院
    major: string // 专业
    campus: string // 校区
    class_name: string // 班级
    counselor: string // 辅导员
    icon: string;
}

type Response = {
    code: number;
    message: string;
    data: any | undefined;
}
export type {Response, Course};