import {Box, Button, ButtonGroup, CircularProgress, Dialog, Typography} from "@mui/material";
import {Course} from "./types";
import {useEffect, useState} from "react";
import Download from "./download";

export default function GetCourseWindow({course, setSelectedCourse, setErrorMessage}:
                                            {
                                                course: Course,
                                                setSelectedCourse: (course: Course | null) => void,
                                                setErrorMessage: (message: string | null) => void
                                            }) {

    const [code, setCode] = useState<string>("");

    useEffect(() => {
        if (course !== null && course.class_name !== "") {
            fetch("/api/get_code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    keyword: course.class_name,
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
    }, [course, setErrorMessage]);

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
                {code ? <><Typography sx={{
                    color: "var(--primary-100)",
                    fontSize: "20px",
                    fontWeight: "bold",
                }}>{course.class_name}</Typography>
                    <Typography sx={{
                        color: "var(--text-100)",
                        fontSize: "13px",
                        fontWeight: "bold",
                    }}
                                id="code">{code}</Typography>
                    <Button variant="contained" onClick={() => {
                        setErrorMessage("您的设备不支持一键复制 请手动选择");
                        const codeElement = document.getElementById("code");
                        if (codeElement) {
                            const selection = document.createRange();
                            selection.selectNodeContents(codeElement);
                            const selectionRange = window.getSelection();
                            if (selectionRange) {
                                selectionRange.removeAllRanges();
                                selectionRange.addRange(selection);
                            }
                        }
                        navigator.clipboard.writeText(code).then(() => {
                            setErrorMessage("复制成功");
                            const selectionRange = window.getSelection();
                            if (selectionRange) {
                                selectionRange.removeAllRanges();
                            }
                        }).catch(error => {
                            setErrorMessage(error);
                        });
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

                    <Download/>
                    <Typography
                        sx={{
                            paddingBottom: "10px"
                        }}>下载WakeUp课程表
                    </Typography>
                    <ButtonGroup sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        borderRadius: "10px",
                    }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "var(--primary-100)",
                                color: "var(--text-100)",
                                "&:hover": {
                                    bgcolor: "var(--primary-200)",
                                },
                            }}
                            onClick={() => window.open('https://cdn1.d5v.cc/CDN/Project/Course/wakeup.apk')}
                        >安卓
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "var(--primary-100)",
                                color: "var(--text-100)",
                                "&:hover": {
                                    bgcolor: "var(--primary-200)",
                                },
                            }}
                            onClick={() => window.open('appmarket://details?id=com.suda.yzune.wakeupschedule.hmos')}>
                            鸿蒙
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: "var(--primary-100)",
                                color: "var(--text-100)",
                                "&:hover": {
                                    bgcolor: "var(--primary-200)",
                                },
                            }}
                            onClick={() => window.open('https://apps.apple.com/cn/app/wakeup%E8%AF%BE%E7%A8%8B%E8%A1%A8/id1553402284')}
                        >IOS
                        </Button>
                    </ButtonGroup>
                </> : <>
                    <Typography sx={{
                        color: "var(--text-100)",
                        fontSize: "16px",
                        marginTop: "10px",
                    }}>
                        生成中，请稍候...
                    </Typography>
                    <CircularProgress sx={{marginTop: "20px", color: "var(--primary-100)"}}/>
                </>}

            </Box>
        </Dialog>
    )
}