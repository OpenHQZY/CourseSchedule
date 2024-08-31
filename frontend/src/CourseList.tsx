import { Box, Button, Typography } from "@mui/material"
import { Course } from "./types"
import GetCourseWindow from "./getCourseWindow"
import { useState } from "react";


export default function CourseList({ courseList, setErrorMessage }:
    { courseList: Course[], setErrorMessage: (message: string | null) => void }) {

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);


    function CourseItem({ course }: { course: Course }) {

        let icon = `https://cdn1.d5v.cc/CDN/Project/Course/icons/${course.icon}.png`

        return (
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "20px",
                bgcolor: "var(--bg-200)",
                borderRadius: "10px",
                height: "80px",
                border: "1px solid var(--primary-100)",
                paddingLeft: "20px",
                paddingRight: "20px",
                width: "90%",
            }}>
                <img src={icon} style={{
                    height: "60px",
                    width: "60px",
                }} />
                <Typography fontSize={20} color="var(--primary-100)" fontWeight={"bold"}>
                    {course.name}
                </Typography>
                <Button variant="contained" color="primary" sx={{
                    color: "var(--text-100)",
                    bgcolor: "var(--primary-100)",
                }} onClick={() => setSelectedCourse(course)}>
                    获取课表
                </Button>
            </Box>
        )
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginTop: "20px",
            overflow: "auto",
            paddingBottom: "150px"
        }}>
            <Typography variant="h4" fontSize={30} color="var(--primary-100)" fontWeight={"bold"}>
                课程列表
            </Typography>
            {courseList.map((course) => (
                <CourseItem key={course.name} course={course} />
            ))}
            {selectedCourse && <GetCourseWindow course={selectedCourse} setSelectedCourse={setSelectedCourse} setErrorMessage={setErrorMessage} />}
        </Box>
    )
}