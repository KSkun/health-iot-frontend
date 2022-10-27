import * as React from 'react';
import {styled, createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {mainListItems} from '../components/listItems';
import Copyright from "../components/Copyright";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {renderCellExpand} from "../components/renderCellExpand";

import axios from 'axios';
import SnackbarAlert from "../components/SnackbarAlert";
import {getErrorMessage} from "../utils/errorHandler";
import {apiUrlPrefix} from "../config";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        '& .MuiDrawer-paper': {
            position: 'relative',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
            }),
        },
    }),
);

const mdTheme = createTheme();

const columns: GridColDef[] = [
    {field: "id", headerName: "ID", width: 220},
    {field: "device_id", headerName: "设备ID", width: 220},
    {
        field: "time",
        headerName: "上报时间",
        width: 155,
        valueFormatter: ({value}) => new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(value)
    },
    {
        field: "status", headerName: "设备状态", width: 150, renderCell: (param) => {
            let output = '';
            for (let [k, v] of Object.entries(param.value)) output += k + ": " + v + ', ';
            output = output.slice(0, -2);
            param.value = output;
            return renderCellExpand(param);
        }
    },
    {
        field: "sensor", headerName: "传感器信息", width: 150, renderCell: (param) => {
            let output = '';
            for (let [k, v] of Object.entries(param.value)) output += k + ": " + v + ', ';
            output = output.slice(0, -2);
            param.value = output;
            return renderCellExpand(param);
        }
    },
    {
        field: "warnings", headerName: "警告信息", width: 300, renderCell: (param) => {
            let output = '';
            for (let o of param.value) output += JSON.stringify(o) + ', ';
            output = output.slice(0, -2);
            param.value = output;
            return renderCellExpand(param);
        }
    }
]

function DataContent() {
    let navigate = useNavigate();
    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => setOpen(!open);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('error');

    const [devices, setDevices] = useState(null);
    const [device, setDevice] = useState(null);
    const [data, setData] = useState(null);

    function refreshData(device) {
        let token = localStorage.getItem('token');
        let url = apiUrlPrefix + '/device/data';
        if (device != null) url += '?device=' + device;
        axios.get(url, {
            headers: {'Authorization': 'Bearer ' + token}
        }).then(response => {
            let prepared = [];
            for (let d of response.data.data.reports) {
                let o = d.report;
                o.warnings = d.warnings;
                prepared.push(o);
            }
            setData(prepared);
        }).catch(error => {
            setSeverity('error');
            setMessage(getErrorMessage(error));
            setError(true);
        });
    }

    function onSelectChange(event) {
        setDevice(event.target.value);
        refreshData(event.target.value);
    }

    useEffect(() => {
        let tokenExpire = localStorage.getItem('token_expire');
        if (tokenExpire == null || Date.now() >= tokenExpire) {
            localStorage.removeItem('token');
            localStorage.removeItem('token_expire');
            navigate('/login');
        }

        let token = localStorage.getItem('token');
        axios.get(apiUrlPrefix + '/device/data', {
            headers: {'Authorization': 'Bearer ' + token}
        }).then(response => {
            let prepared = [];
            for (let d of response.data.data.reports) {
                let o = d.report;
                o.warnings = d.warnings;
                prepared.push(o);
            }
            setData(prepared);
        }).catch(error => {
            setSeverity('error');
            setMessage(getErrorMessage(error));
            setError(true);
        });
        axios.get(apiUrlPrefix + '/device/list', {
            headers: {'Authorization': 'Bearer ' + token}
        }).then(response => {
            setDevices(response.data.data.devices);
        }).catch(error => {
            setSeverity('error');
            setMessage(getErrorMessage(error));
            setError(true);
        });
    }, [navigate]);

    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{display: 'flex'}}>
                <CssBaseline/>
                <AppBar position="absolute" open={open}>
                    <Toolbar sx={{pr: '24px'}}>
                        <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={toggleDrawer}
                                    sx={{marginRight: '36px', ...(open && {display: 'none'})}}>
                            <MenuIcon/>
                        </IconButton>
                        <Typography component="h1" variant="h6" color="inherit" noWrap sx={{flexGrow: 1}}>
                            Health IoT Platform
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <Toolbar sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: [1]}}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon/>
                        </IconButton>
                    </Toolbar>
                    <Divider/>
                    <List component="nav">
                        {mainListItems}
                    </List>
                </Drawer>
                <Box component="main"
                     sx={{
                         backgroundColor: (theme) =>
                             theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
                         flexGrow: 1, height: '100vh', overflow: 'auto'
                     }}>
                    <Toolbar/>
                    <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
                        <Grid container spacing={3}>
                            <Grid item sm={12}>
                                <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 80}}>
                                    <FormControl size="small">
                                        <InputLabel>设备</InputLabel>
                                        <Select value={device} label="设备" onChange={onSelectChange}>
                                            <MenuItem value={null}><em>不指定</em></MenuItem>
                                            {devices != null ? devices.map(d => (
                                                <MenuItem value={d.id}>{d.name} ({d.id})</MenuItem>
                                            )) : ''}
                                        </Select>
                                    </FormControl>
                                </Paper>
                            </Grid>
                            <Grid item sm={12}>
                                <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 500}}>
                                    {data != null ?
                                        <DataGrid rows={data} columns={columns} pageSize={5} rowsPerPageOptions={[5]}
                                                  disableSelectionOnClick/> : ''}
                                </Paper>
                            </Grid>
                        </Grid>
                        <Copyright sx={{pt: 4}}/>
                    </Container>
                </Box>
                {error ? <SnackbarAlert message={message} severity={severity}/> : ''}
            </Box>
        </ThemeProvider>
    );
}

export default function Data() {
    return <DataContent/>;
}
