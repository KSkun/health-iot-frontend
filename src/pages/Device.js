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
import {useNavigate, useParams} from "react-router-dom";

import axios from 'axios';
import SnackbarAlert from "../components/SnackbarAlert";
import {getErrorMessage} from "../utils/errorHandler";
import {amapAccessKey, apiUrlPrefix} from "../config";
import Title from "../components/Title";

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

function DeviceContent() {
    let {deviceID} = useParams();
    let navigate = useNavigate();
    const [open, setOpen] = React.useState(true);
    const toggleDrawer = () => setOpen(!open);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('error');

    const [deviceInfo, setDeviceInfo] = useState(null);

    useEffect(() => {
        let tokenExpire = localStorage.getItem('token_expire');
        if (tokenExpire == null || Date.now() >= tokenExpire) {
            localStorage.removeItem('token');
            localStorage.removeItem('token_expire');
            navigate('/login');
        }
        let token = localStorage.getItem('token');

        function refreshDevice() {
            axios.get(apiUrlPrefix + '/device/' + deviceID, {
                headers: {'Authorization': 'Bearer ' + token}
            }).then(response => {
                setDeviceInfo(response.data.data);
            }).catch(error => {
                setSeverity('error');
                setMessage(getErrorMessage(error));
                setError(true);
            });
        }

        refreshDevice();
        let interval = setInterval(refreshDevice, 20000);
        return () => clearInterval(interval);
    }, [deviceID, navigate]);

    function DeviceInfoGrid() {
        return (
            <Grid container spacing={3}>
                <Grid item sm={6}>
                    <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 500}}>
                        <Title>{deviceInfo.device.name}</Title>
                        <Typography variant='caption'>
                            序列号：{deviceInfo.device.serial}
                        </Typography>
                        <Divider/>
                        <Typography variant='h6'>设备状态</Typography>
                        <Typography>
                                        <span style={{color: deviceInfo.online ? 'green' : 'gray'}}>
                                            {deviceInfo.online ? '在线' : '离线'}
                                        </span>
                            &nbsp;&nbsp;
                            电量{deviceInfo.device.status.battery}%
                            &nbsp;&nbsp;
                            <span style={{color: deviceInfo.device.status.locating ? 'green' : 'red'}}>
                                            {deviceInfo.device.status.locating ? '定位正常' : '定位异常'}
                                        </span>
                            &nbsp;&nbsp;&nbsp;
                            <span style={{color: deviceInfo.device.status.wearing ? 'green' : 'red'}}>
                                            {deviceInfo.device.status.wearing ? '穿戴正常' : '穿戴异常'}
                                        </span>
                        </Typography>
                        <Typography>
                            心率：{deviceInfo.device.sensor.heart_rate}次/分钟
                        </Typography>
                        <Typography>
                            血氧饱和度：{deviceInfo.device.sensor.blood_oxygen}%
                        </Typography>
                        <Typography>
                            求救：{deviceInfo.device.sensor.sos_warning ? '是' : '否'}
                        </Typography>
                        <Typography>
                            跌倒：{deviceInfo.device.sensor.fall_warning ? '是' : '否'}
                        </Typography>
                        <Typography>最后更新时间：{new Intl.DateTimeFormat('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        }).format(deviceInfo.device.last_report_time)}</Typography>
                        <Divider/>
                        <Typography variant='h6'>当前警告</Typography>
                        {deviceInfo.warnings.map(w => (
                            <Typography>{w.field}：{w.message}</Typography>
                        ))}
                    </Paper>
                </Grid>
                <Grid item sm={6}>
                    <Paper sx={{p: 2, display: 'flex', flexDirection: 'column', height: 500}}>
                        <Title>定位</Title>
                        <iframe style={{height: '100%'}} title='amap_iframe' src={'https://m.amap.com/navi/?dest='
                            + deviceInfo.device.sensor.longitude + ','
                            + deviceInfo.device.sensor.latitude
                            + '&destName='
                            + deviceInfo.device.name
                            + '&hideRouteIcon=1&key='
                            + amapAccessKey}/>
                    </Paper>
                </Grid>
            </Grid>
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
                        {deviceInfo != null ? <DeviceInfoGrid/> : ''}
                        <Copyright sx={{pt: 4}}/>
                    </Container>
                </Box>
                {error ? <SnackbarAlert message={message} severity={severity}/> : ''}
            </Box>
        </ThemeProvider>
    );
}

export default function Device() {
    return <DeviceContent/>;
}
