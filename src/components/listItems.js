import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import WatchIcon from '@mui/icons-material/Watch';
import DatasetIcon from '@mui/icons-material/Dataset';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {Link} from "react-router-dom";

export const mainListItems = (
    <React.Fragment>
        <Link to='/dashboard' style={{textDecoration: 'none', color: 'inherit'}}>
            <ListItemButton>
                <ListItemIcon><WatchIcon/></ListItemIcon>
                <ListItemText primary="设备"/>
            </ListItemButton>
        </Link>
        <Link to='/report' style={{textDecoration: 'none', color: 'inherit'}}>
            <ListItemButton>
                <ListItemIcon><DatasetIcon/></ListItemIcon>
                <ListItemText primary="数据"/>
            </ListItemButton>
        </Link>
        <Link to='/user' style={{textDecoration: 'none', color: 'inherit'}}>
            <ListItemButton>
                <ListItemIcon><AccountCircleIcon/></ListItemIcon>
                <ListItemText primary="用户"/>
            </ListItemButton>
        </Link>
    </React.Fragment>
);
