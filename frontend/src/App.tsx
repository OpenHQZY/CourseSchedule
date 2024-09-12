import {Container, Snackbar, Typography} from "@mui/material"
import styled from "@emotion/styled"
import SearchBar from "./SearchBar"
import {Response, Course} from "./types"
import {useEffect, useState} from "react"
import CourseList from "./CourseList"
import Notice from "./Notice"
import Autor from "./autor"

const StyledImage = styled.img`
    height: 22vh;
    padding-bottom: 10px;
`

function App() {
    const [courseList, setCourseList] = useState<Course[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [notice, setNotice] = useState<string>("");

    useEffect(() => {
        fetch("/api/notice")
            .then(response => response.json())
            .then((data: Response) => {
                if (data.code === 200) {
                    setNotice(data.data);
                } else {
                    setNotice("");
                }
            })
            .catch((e) => {
                setNotice(e.toString());
            });
        console.log(notice);
    }, []);

    return (
        <Container sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "5vh",
            width: "100%",
        }}>
            <Snackbar
                open={errorMessage !== ""}
                onClose={() => setErrorMessage("")}
                message={errorMessage}
            />
            <StyledImage src="https://cdn1.d5v.cc/CDN/Image/hq.png"/>
            <Typography variant="h1" fontSize={38} color="var(--primary-100)" fontWeight={"bold"}>
                湖汽课表
            </Typography>
            <SearchBar setCourseList={setCourseList} setErrorMessage={setErrorMessage}/>
            {courseList.length > 0 && <CourseList courseList={courseList}
                                                  setErrorMessage={(msg: string | null) => setErrorMessage(msg ?? "")}/>}
            {notice !== "" && <Notice notice={notice}/>}

            <Autor show={courseList.length === 0}/>
        </Container>
    )
}

export default App
