import React, { useState, useEffect } from 'react'
import styles from './Post.module.css'
import { db } from '../firebase'
import firebase from 'firebase/app'

import { useSelector } from 'react-redux'
import { selectUser } from '../features/userSlice'

import dayjs from 'dayjs'

import { Avatar } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Message from '@material-ui/icons/Message'
import Send from '@material-ui/icons/Send'

interface User {
  id: string
  displayName: string
  avatar: string
  image: string
  text: string
  timestamp: any
}

interface Comments {
  id: string
  displayName: string
  avatar: string
  text: string
  timestamp: any
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
      },
    },
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  }),
)

const Post: React.FC<User> = (props) => {
  const classes = useStyles()
  const user = useSelector(selectUser)
  const [reply, setReply] = useState('')
  const [comments, setComments] = useState<Comments[]>([
    {
      id: '',
      displayName: '',
      avatar: '',
      text: '',
      timestamp: null,
    },
  ])
  const [openComments, setOpenComments] = useState(false)

  useEffect(() => {
    const unSub = db
      .collection('posts')
      .doc(props.id)
      .collection('comments')
      .orderBy('timestamp', 'asc')
      .onSnapshot((snapshot: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            displayName: doc.data().displayName,
            avatar: doc.data().avatar,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
          })),
        )
      })
    return () => {
      unSub()
    }
  }, [props.id])

  const newReply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    db.collection('posts').doc(props.id).collection('comments').add({
      avatar: user.photoURL,
      text: reply,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      displayName: user.displayName,
    })
    setReply('')
  }

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{props.displayName}</span>
              <span className={styles.post_headerTime}>
                {dayjs.unix(props.timestamp?.seconds).format('YYYY/MM/DD hh:mm:ss')}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{props.text}</p>
            {props.image && (
              <div className={styles.post_tweetImage}>
                <img src={props.image} alt='tweet' />
              </div>
            )}
          </div>
        </div>

        <Message className={styles.post_commentIcon} onClick={() => setOpenComments(!openComments)} />
        {openComments && (
          <>
            {comments.map((reply) => (
              <div key={reply.id} className={styles.post_reply}>
                <Avatar src={reply.avatar} className={classes.small} />
                <span className={styles.post_replyUser}>@{reply.displayName}</span>
                <span className={styles.post_replyText}>{reply.text}</span>
                <span className={styles.post_headerTime}>
                  {dayjs.unix(reply.timestamp?.seconds).format('YYYY/MM/DD hh:mm:ss')}
                </span>
              </div>
            ))}

            <form onSubmit={newReply}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type='text'
                  placeholder='Type new comment'
                  value={reply}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setReply(e.target.value)
                  }}
                />
                <button disabled={!reply} className={reply ? styles.post_button : styles.post_buttonDisable}>
                  <Send className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default Post
