import { Box } from "@mui/material";

export default function Download() {
    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        marginTop: "20px",
        alignItems: "center",
        justifyContent: "center",
        height: "350px",
    }}>
        <img src="https://cdn1.d5v.cc/CDN/Project/Course/res.png" style={{
            height: "100%",
            width: "100%",
        }} alt={"示例"}></img>
    </Box>
}