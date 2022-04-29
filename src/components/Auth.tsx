import React, { useState } from 'react'
import styles from './Auth.module.css'
import { useDispatch } from 'react-redux'
import { updateUserProfile } from '../features/userSlice'
import { auth, provider, storage } from '../firebase'

import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Link from '@material-ui/core/Link'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import CameraIcon from '@material-ui/icons/Camera'
import EmailIcon from '@material-ui/icons/Email'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import SendIcon from '@material-ui/icons/Send'
import { IconButton, Modal } from '@material-ui/core'

const getModalStyle = () => {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  }
}

function Copyright() {
  return (
    <Typography variant='body2' color='textSecondary' align='center'>
      {'Copyright © '}
      <Link color='inherit'>T.S.</Link> {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundColor: theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  modal: {
    outline: 'none',
    position: 'absolute',
    width: 400,
    borderRadius: 10,
    backgroundColor: 'white',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(10),
  },
}))

const Auth: React.FC = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatarImage, setAvatarImage] = useState<File | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
    await auth
      .sendPasswordResetEmail(resetEmail)
      .then(() => {
        setOpenModal(false)
        setResetEmail('')
      })
      .catch((err: any) => {
        alert(err.message)
        setResetEmail('')
      })
  }

  const signInEmail = async () => {
    await auth.signInWithEmailAndPassword(email, password)
  }
  const signUpEmail = async () => {
    const authUser = await auth.createUserWithEmailAndPassword(email, password)
    let photoURL = ''
    if (avatarImage) {
      // make unique randomChar
      const S = 'abcdefghijklnmopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789'
      const N = 16
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('')

      const fileName = randomChar + '_' + avatarImage.name
      await storage.ref(`avatars/${fileName}`).put(avatarImage)
      photoURL = await storage.ref('avatars').child(fileName).getDownloadURL()
    }
    await authUser.user?.updateProfile({
      displayName,
      photoURL,
    })
    dispatch(
      updateUserProfile({
        displayName,
        photoURL,
      }),
    )
  }

  const signInGoogle = async () => {
    await auth.signInWithPopup(provider).catch((err: any) => alert(err.message))
  }
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setAvatarImage(e.target.files![0])
      e.target.value = ''
    }
  }

  return (
    <Grid container component='main' className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5'>
            {isLogin ? 'Login' : 'Register'}
          </Typography>

          {!isLogin && (
            <>
              <TextField
                variant='outlined'
                margin='normal'
                required
                fullWidth
                id='displayname'
                label='name'
                name='displayname'
                autoFocus
                value={displayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setDisplayName(e.target.value)
                }}
              />
              <Box textAlign='center'>
                <IconButton>
                  <label>
                    <AccountCircleIcon
                      fontSize='large'
                      className={avatarImage ? styles.login_addIcon_loaded : styles.login_addIcon}
                    />
                    <input className={styles.login_hiddenIcon} type='file' onChange={onChangeImageHandler} />
                  </label>
                </IconButton>
              </Box>
            </>
          )}

          <form className={classes.form} noValidate>
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              id='email'
              label='Email Address'
              name='email'
              autoComplete='email'
              autoFocus
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <TextField
              variant='outlined'
              margin='normal'
              required
              fullWidth
              name='password'
              label='Password'
              type='password'
              id='password'
              autoComplete='current-password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            <FormControlLabel control={<Checkbox value='remember' color='primary' />} label='Remember me' />
            <Button
              disabled={isLogin ? !email || password.length < 6 : !displayName || !email || !avatarImage}
              fullWidth
              variant='contained'
              color='primary'
              className={classes.submit}
              startIcon={<EmailIcon />}
              onClick={
                isLogin
                  ? async () => {
                      try {
                        await signInEmail()
                      } catch (err: any) {
                        alert(err.message)
                      }
                    }
                  : async () => {
                      try {
                        await signUpEmail()
                      } catch (err: any) {
                        alert(err.message)
                      }
                    }
              }
            >
              {isLogin ? 'Login' : 'Register'}
            </Button>

            <Grid container>
              <Grid item xs>
                <span
                  className={styles.login_reset}
                  onClick={() => {
                    setOpenModal(true)
                  }}
                >
                  Forgot Password?
                </span>
              </Grid>
              <Grid item>
                <span className={styles.login_toggleMode} onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Create new account' : 'Back to login'}
                </span>
              </Grid>
            </Grid>
            <Button
              fullWidth
              variant='contained'
              color='primary'
              startIcon={<CameraIcon />}
              className={classes.submit}
              onClick={signInGoogle}
            >
              Sign In With Google
            </Button>
            <Box mt={5}>
              <Copyright />
            </Box>
          </form>
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <div style={getModalStyle()} className={classes.modal}>
              <div className={styles.login_modal}>
                <TextField
                  InputLabelProps={{
                    shrink: true,
                  }}
                  type='email'
                  name='email'
                  label='Reset E-mail'
                  value={resetEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setResetEmail(e.target.value)
                  }}
                />
                <IconButton onClick={sendResetEmail}>
                  <SendIcon />
                </IconButton>
              </div>
            </div>
          </Modal>
        </div>
      </Grid>
    </Grid>
  )
}

export default Auth
