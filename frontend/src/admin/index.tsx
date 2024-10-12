import { useEffect, useState } from "react";
import { Button, TextField, Typography, Box } from '@mui/material';

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

    return (
        <Box>
            <SetNotice />
            <hr />
            <AddData />
            <hr />
            <DataFiles />
        </Box>
    );
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
            setOk(response.ok);
        })
    }

    return (
        <Box display="flex" alignItems="center">
            <TextField id="notice" label="公告" variant="outlined" />
            <Button variant="contained" color="primary" onClick={handleSetNotice}>设置公告</Button>
            {ok && <Typography color="success.main">设置成功</Typography>}
        </Box>
    );
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

        alert(response.ok ? "文件上传成功" : "文件上传失败");
    }

    return (
        <Box>
            <input type="file" multiple id="upload-data" />
            <Button variant="contained" color="primary" onClick={handleFileUpload}>上传文件</Button>
        </Box>
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
        })
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

    const handleClean = async () => {
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

    return (
        <Box>
            <Button variant="outlined" color="primary" onClick={handleClean}>清空</Button>
            <Button variant="outlined" color="primary" onClick={handleRefresh}>刷新</Button>
            {files.map(file => (
                <Box key={file} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography>{file}</Typography>
                    <Button variant="outlined" color="primary" onClick={() => handleDelete(file)}>删除</Button>
                </Box>
            ))}
        </Box>
    );
}