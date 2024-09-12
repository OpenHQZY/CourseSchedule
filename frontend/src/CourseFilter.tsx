import {Select} from 'antd';
import "./CourseFilter.css";
import {Course} from "./types.tsx";
import {getAllCampus, getAllDepartments, getAllGrades, getAllMajors} from "./courseData.ts";

const {Option} = Select;

const CourseFilter = ({Options, setOptions}: {
    Options: Course,
    setOptions: (options: Course) => void
}) => {

    const selectStyle = {
        width: '100%',
        marginBottom: '16px',
        backgroundColor: 'var(--bg-100)',
    };
    
    return (
        <div style={{width: '318px', margin: "10px"}}>
            <div>
                <label htmlFor="grade" className="block mb-2" style={{color: 'var(--text-100)'}}>年级</label>
                <Select
                    id="grade"
                    value={Options.grade}
                    onChange={(value: string) => {
                        setOptions({...Options, grade: value});
                    }}
                    style={selectStyle}
                >
                    <Option value="">全部</Option>
                    {getAllGrades().map((grade: any) => {
                        return <Option value={grade} key={grade}>{grade}</Option>;
                    })}
                </Select>
            </div>

            <div>
                <label htmlFor="department" className="block mb-2" style={{color: 'var(--text-100)'}}>学院</label>
                <Select
                    id="department"
                    value={Options.department}
                    onChange={(value: string) => {
                        setOptions({...Options, department: value});
                    }}
                    style={selectStyle}
                >
                    <Option value="">全部</Option>
                    {getAllDepartments().map((Department: any) => {
                        return <Option value={Department} key={Department}>{Department}</Option>;
                    })}
                </Select>
            </div>

            <div>
                <label htmlFor="major" className="block mb-2" style={{color: 'var(--text-100)'}}>专业</label>
                <Select
                    id="major"
                    value={Options.major}
                    onChange={(value: string) => {
                        setOptions({...Options, major: value});
                    }}
                    style={selectStyle}
                >
                    <Option value="">全部</Option>
                    {getAllMajors().map((major: any) => {
                        return <Option value={major} key={major}>{major}</Option>;
                    })}
                </Select>
            </div>

            <div>
                <label htmlFor="campus" className="block mb-2" style={{color: 'var(--text-100)'}}>校区</label>
                <Select
                    id="campus"
                    value={Options.campus}
                    onChange={(value: string) => {
                        setOptions({...Options, campus: value});
                    }}
                    style={selectStyle}
                >
                    <Option value="">全部</Option>
                    {getAllCampus().map((campus: any) => {
                        return <Option value={campus} key={campus}>{campus}</Option>;
                    })}
                </Select>
            </div>

        </div>
    );
};

export default CourseFilter;