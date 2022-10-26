import React, {useEffect, useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import SnackbarAlert from "../components/SnackbarAlert";
import Copyright from "../components/Copyright";
import {Link, useNavigate} from "react-router-dom";

import axios from "axios";
import {apiUrlPrefix} from "../config";
import {getErrorMessage} from "../utils/errorHandler";
import delay from "../utils/delay";

const theme = createTheme();

export default function Login() {
    let navigate = useNavigate();
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('error');

    useEffect(() => {
        let tokenExpire = localStorage.getItem('token_expire');
        if (Date.now() < tokenExpire * 1000) {
            navigate('/dashboard');
        }
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        axios.get(apiUrlPrefix + '/user/token', {
            params: {
                name: data.get('name'),
                password: data.get('password')
            }
        }).then(response => {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('token_expire', response.data.data.expire_time);
            setSeverity('success');
            setMessage('已登录，即将跳转至主页');
            setError(true);
            delay(1000).then(() => navigate('/dashboard'));
        }).catch(error => {
            setSeverity('error');
            setMessage(getErrorMessage(error));
            setError(true);
        });
        setError(false);
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box sx={{marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center',}}>
                    <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}><LoginOutlinedIcon/></Avatar>
                    <Typography component="h1" variant="h5">登录</Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <TextField margin="normal" required fullWidth id="name" label="用户名" name="name"
                                   autoComplete="name" autoFocus/>
                        <TextField margin="normal" required fullWidth name="password" label="密码" type="password"
                                   id="password" autoComplete="current-password"/>
                        <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>登录</Button>
                        <Link to="/register">还没有用户？前往注册</Link>
                    </Box>
                </Box>
                {error ? <SnackbarAlert message={message} severity={severity}/> : ''}
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
        </ThemeProvider>
    );
}
