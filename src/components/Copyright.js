import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import * as React from "react";
import {beianText} from "../config";

export default function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            <Link color="inherit" href="https://beian.miit.gov.cn/">{beianText}</Link>
        </Typography>
    );
}