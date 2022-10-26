import React, {useEffect, useState} from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import SnackbarAlert from '../components/SnackbarAlert';
import Copyright from "../components/Copyright";
import {Link} from "react-router-dom";

import axios from "axios";
import {apiUrlPrefix} from "../config";
import {getErrorMessage} from "../utils/errorHandler";
import delay from "../utils/delay";
import {useNavigate} from "react-router-dom";

const theme = createTheme();

export default function Register() {
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        axios.post(apiUrlPrefix + '/user', {
            name: data.get('name'),
            password: data.get('password')
        }).then(response => {
            console.log(response.data.data);
            setSeverity('success');
            setMessage('注册成功，即将跳转到登录页');
            setError(true);
            delay(1000).then(() => navigate('/login'));
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
                    <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}><PersonAddAlt1OutlinedIcon/></Avatar>
                    <Typography component="h1" variant="h5">注册</Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <TextField margin="normal" required fullWidth id="name" label="用户名" name="name"
                                   autoComplete="name" autoFocus/>
                        <TextField margin="normal" required fullWidth name="password" label="密码" type="password"
                                   id="password" autoComplete="current-password"/>
                        <Button type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}>注册</Button>
                        <Link to="/login">已经注册了？前往登录</Link>
                    </Box>
                </Box>
                {error ? <SnackbarAlert message={message} severity={severity}/> : ''}
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
        </ThemeProvider>
    );
}
