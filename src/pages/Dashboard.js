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
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {mainListItems} from '../components/listItems';
import Copyright from "../components/Copyright";
import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import WatchIcon from '@mui/icons-material/Watch';

import axios from 'axios';
import SnackbarAlert from "../components/SnackbarAlert";
import {getErrorMessage} from "../utils/errorHandler";
import {apiUrlPrefix} from "../config";
import Title from "../components/Title";
import Button from "@mui/material/Button";
import {Dialog, DialogTitle} from "@mui/material";
import TextField from "@mui/material/TextField";

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

function DashboardContent() {
    let navigate = useNavigate();
    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => setOpen(!open);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('error');

    const [devices, setDevices] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        let tokenExpire = localStorage.getItem('token_expire');
        if (tokenExpire == null || Date.now() >= tokenExpire) {
            localStorage.removeItem('token');
            localStorage.removeItem('token_expire');
            navigate('/login');
        }
        let token = localStorage.getItem('token');

        function _refreshDeviceList() {
            axios.get(apiUrlPrefix + '/device/list', {
                headers: {'Authorization': 'Bearer ' + token}
            }).then(response => {
                setDevices(response.data.data.devices);
            }).catch(error => {
                setSeverity('error');
                setMessage(getErrorMessage(error));
                setError(true);
            });
        }

        _refreshDeviceList();
        let interval = setInterval(_refreshDeviceList, 20000);
        return () => clearInterval(interval);
    }, [navigate]);

    function handleOpenDialog() {
        setDialogOpen(true);
    }

    function AddDeviceDialog() {
        function handleClose() {
            setDialogOpen(false);
        }

        function handleSubmit(event) {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            let token = localStorage.getItem('token');
            axios.post(apiUrlPrefix + '/device', {
                name: data.get('name'),
                serial: data.get('serial')
            }, {
                headers: {'Authorization': 'Bearer ' + token}
            }).then(() => {
                setSeverity('success');
                setMessage('设备已添加');
                setError(true);
                axios.get(apiUrlPrefix + '/device/list', {
                    headers: {'Authorization': 'Bearer ' + token}
                }).then(response => {
                    setDevices(response.data.data.devices);
                }).catch(error => {
                    setSeverity('error');
                    setMessage(getErrorMessage(error));
                    setError(true);
                });
                setDialogOpen(false);
            }).catch(error => {
                setSeverity('error');
                setMessage(getErrorMessage(error));
                setError(true);
            });
            setError(false);
        }

        return (
            <Dialog onClose={handleClose} open={dialogOpen}>
                <DialogTitle>添加设备</DialogTitle>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1, p: 5}}>
                    <TextField margin="normal" required fullWidth id="name" label="设备名称" name="name"
                               autoComplete="name" autoFocus/>
                    <TextField margin="normal" required fullWidth id="serial" label="序列号" name="serial"
                               autoComplete="serial" autoFocus/>
                    <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>提交</Button>
                </Box>
            </Dialog>
        );
    }

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
                                <Paper sx={{p: 2}}>
                                    <Button variant="contained" onClick={handleOpenDialog}>添加设备</Button>
                                </Paper>
                            </Grid>
                            {devices.map(d => (
                                <Grid item sm={3}>
                                    <Link to={'/device/' + d.id} style={{textDecoration: 'none'}}>
                                        <Paper sx={{p: 2, display: 'flex', flexDirection: 'column'}}>
                                            <Title>{d.name}</Title>
                                            <Typography sx={{flex: 1}} variant='caption'>S/N: {d.serial}</Typography>
                                            <WatchIcon fontSize='large'/>
                                            <Typography sx={{flex: 1}}>
                                                <span style={{color: d.online ? 'green' : 'gray'}}>
                                                    {d.online ? '在线' : '离线'}
                                                </span>
                                                &nbsp;&nbsp;
                                                <span style={{color: d.warning ? 'red' : 'green'}}>
                                                    &#9679;&nbsp;{d.warning ? '警告' : '正常'}
                                                </span>
                                            </Typography>
                                            <Typography sx={{flex: 1}}>电量：{d.battery}%</Typography>
                                        </Paper>
                                    </Link>
                                </Grid>
                            ))}
                        </Grid>
                        <Copyright sx={{pt: 4}}/>
                    </Container>
                </Box>
                {error ? <SnackbarAlert message={message} severity={severity}/> : ''}
                <AddDeviceDialog/>
            </Box>
        </ThemeProvider>
    );
}

export default function Dashboard() {
    return <DashboardContent/>;
}
