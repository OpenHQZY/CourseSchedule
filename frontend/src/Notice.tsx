import { Box, Button, Dialog, Typography } from "@mui/material";
import { useState } from "react";

export default function Notice({ notice }: { notice: string }) {
    const [open, setOpen] = useState(true);

    return (
        <Dialog open={open} onClose={() => setOpen(false)} sx={{
            "& .MuiDialog-paper": {
                backgroundColor: "var(--bg-200)",
                padding: "20px",
                borderRadius: "10px",
                color: "var(--text-100)",
                width: "50%",
            }
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <Typography variant="h6" color="var(--primary-100)" fontWeight={"bold"}>公告</Typography>
                <Typography>{notice}</Typography>
                <Button variant="contained" color="primary" onClick={() => setOpen(false)}
                    sx={{
                        marginTop: "20px",
                        color: "var(--text-100)",
                        bgcolor: "var(--primary-100)",
                        "&:hover": {
                            bgcolor: "var(--primary-200)",
                        }
                    }}>关闭</Button>
            </Box>
        </Dialog>
    )
}
