import { useEffect, useState } from "react"
import "./SearchBar.css"
import { Course, Response } from "./types";



export default function SearchBar(
    { setCourseList, setErrorMessage }:
        { setCourseList: (courseList: Course[]) => void, setErrorMessage: (message: string) => void }
) {

    const [search, setSearch] = useState("");
    const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const handleSubmit = () => {

        if (search.trim() === "") {
            setErrorMessage("请输入搜索内容");
            return;
        }

        const body = {
            "keyword": search,
        }

        fetch("/api/search", {
            method: "POST",
            body: JSON.stringify(body),
        }).then((res) => res.json()).then((data: Response) => {
            if (data.code === 200) {
                if (data.data) {
                    setCourseList(data.data as Course[]);
                    setErrorMessage("");
                } else {
                    setErrorMessage("未找到相关课程,请搜索班级简称,如'会计'、'网络'等");
                }
            } else {
                setErrorMessage(data.message);
            }
        });
    };

    useEffect(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const timeout = setTimeout(() => {
            // 防止输入中文过程中触发
            if (search && !search.includes("'")) {
                handleSubmit();
            }
        }, 500);

        setDebounceTimeout(timeout);

        return () => clearTimeout(timeout);
    }, [search]);


    return (
        <div id="search-bar">
            <div className="grid"></div>
            <div id="poda">
                <div className="glow"></div>
                <div className="darkBorderBg"></div>
                <div className="darkBorderBg"></div>
                <div className="darkBorderBg"></div>

                <div className="white"></div>
                <div className="border"></div>

                <div id="main">
                    <input
                        placeholder="搜索课表..."
                        type="text"
                        name="text"
                        className="input"
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                        onBlur={handleSubmit}
                        value={search}
                    />
                    <div id="input-mask"></div>
                    <div id="pink-mask"></div>
                    <div id="search-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            height="24"
                            fill="none"
                            className="feather feather-search"
                        >
                            <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                            <line
                                stroke="url(#searchl)"
                                y2="16.65"
                                y1="22"
                                x2="16.65"
                                x1="22"
                            ></line>
                            <defs>
                                <linearGradient gradientTransform="rotate(50)" id="search">
                                    <stop stopColor="#f8e7f8" offset="0%"></stop>
                                    <stop stopColor="#b6a9b7" offset="50%"></stop>
                                </linearGradient>
                                <linearGradient id="searchl">
                                    <stop stopColor="#b6a9b7" offset="0%"></stop>
                                    <stop stopColor="#837484" offset="50%"></stop>
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}