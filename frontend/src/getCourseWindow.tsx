import { Box, Button, Dialog, Typography } from "@mui/material";
import { Course } from "./types";
import { useEffect, useState } from "react";
import Download from "./download";

export default function GetCourseWindow({ course, setSelectedCourse, setErrorMessage }:
    { course: Course, setSelectedCourse: (course: Course | null) => void, setErrorMessage: (message: string | null) => void }) {

    const [code, setCode] = useState<string>("");

    useEffect(() => {
        if (course !== null && course.name !== "") {
            fetch("/api/get_code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyword: course.name,
                }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.code == 200) {
                        setCode(data.data);
                    } else {
                        setErrorMessage(data.message)
                    }
                })
                .catch(error => {
                    setErrorMessage(error);
                });
        }
    }, [course]);

    return (
        <Dialog open={course !== null} onClose={() => setSelectedCourse(null)} sx={{
            "& .MuiDialog-paper": {
                backgroundColor: "var(--bg-200)",
                padding: "20px",
                borderRadius: "10px",
                color: "var(--text-100)",
                width: "80%",
            }
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <Typography sx={{
                    color: "var(--primary-100)",
                    fontSize: "20px",
                    fontWeight: "bold",
                }}>{course.name}</Typography>
                <Typography sx={{
                    color: "var(--text-100)",
                    fontSize: "13px",
                    fontWeight: "bold",
                }}>{code}</Typography>
                <Button variant="contained" onClick={() => {
                    navigator.clipboard.writeText(code);
                    setErrorMessage("复制成功");
                }}
                    sx={{
                        marginTop: "20px",
                        bgcolor: "var(--primary-100)",
                        color: "var(--text-100)",
                        "&:hover": {
                            bgcolor: "var(--primary-200)",
                        },
                    }}
                >复制口令</Button>

                <Download />
            </Box>
        </Dialog>
    )
}