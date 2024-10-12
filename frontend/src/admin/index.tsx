import { useEffect, useState } from "react";

function CheckLogin() {
    fetch("/api/check", {
        method: "GET",
        headers: {
            "Authorization": `${localStorage.getItem('token')}`
        }
    }).then(response => {
        if (!response.ok) {
            window.location.href = '/admin/login';
        }
    })
}

export default function Admin() {

    useEffect(() => {
        CheckLogin();
    }, [])

    return <>
        <SetNotice />
        <hr />

        <AddData />
        <hr />
        <DataFiles />
    </>
}

function SetNotice() {
    const [ok, setOk] = useState(false);

    const handleSetNotice = async () => {
        fetch("/api/notice", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ notice: (document.getElementById('notice') as HTMLInputElement).value })
        }).then(response => {
            if (response.ok) {
                setOk(true);
            } else {
                setOk(false);
            }
        })
    }

    return <div style={{
        display: "flex"
    }}>
        <button onClick={handleSetNotice}>设置公告</button>
        <input type="text" id="notice" />
        {ok && <p>设置成功</p>}
    </div>
}

function AddData() {
    const handleFileUpload = async () => {
        const files = (document.getElementById('upload-data') as HTMLInputElement).files;

        if (!files) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        const response = await fetch("/api/upload", {
            method: 'PUT',
            headers: {
                "Authorization": `${localStorage.getItem('token')}`
            },
            body: formData
        });

        if (response.ok) {
            alert("文件上传成功");
        } else {
            alert("文件上传失败");
        }
    }

    return (
        <div>
            <input type="file" multiple id="upload-data" />
            <button onClick={() => {
                handleFileUpload();
            }}>上传文件</button>
        </div>
    );
}

function DataFiles() {
    const [files, setFiles] = useState<string[]>([]);

    useEffect(() => {
        fetch("/api/data", {
            headers: {
                "Authorization": `${localStorage.getItem('token')}`
            }
        }).then(response => response.json())
            .then(data => {
                setFiles(data.files);
            })
    }, [])

    const handleDelete = async (file: string) => {
        fetch("/api/data/" + file, {
            method: 'DELETE',
            headers: {
                "Authorization": `${localStorage.getItem('token')}`
            },
        }).then(response => {
            if (response.ok) {
                setFiles(files.filter(f => f !== file));
            }
        }
        )
    }   

    const handleRefresh = async () => {
        fetch("/api/data", {
            headers: {
                "Authorization": `${localStorage.getItem('token')}`
            }
        }).then(response => response.json())
            .then(data => {
                setFiles(data.files);
            })
    }

    const handleCLean = async () => {
        fetch("/api/clean", {
            method: 'DELETE',
            headers: {
                "Authorization": `${localStorage.getItem('token')}`
            }
        }).then(response => {
            if (response.ok) {
                setFiles([]);
            }
        })
    }

    return <div>
        <>
            <button onClick={() => {handleCLean()} }>清空</button>
            <button onClick={() => {handleRefresh()}}>刷新</button>
        </>
        {files.map(file => <p>{file} <button onClick={() => handleDelete(file)}>删除</button></p>)}
    </div>
}