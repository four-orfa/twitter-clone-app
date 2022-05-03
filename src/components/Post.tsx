import React, { useState, useEffect } from 'react'
import styles from './Post.module.css'
import { db } from '../firebase'
import firebase from 'firebase/app'

import { useSelector } from 'react-redux'
import { selectUser } from '../features/userSlice'

import dayjs from 'dayjs'

import { Avatar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import Message from '@material-ui/icons/Message'
import Send from '@material-ui/icons/Send'

interface User {
  id: string
  avatar: string
  image: string
  text: string
  timestamp: any
  displayName: string
}

const Post: React.FC<User> = (props) => {
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
          </div>
        </div>
        {props.image && (
          <div className={styles.post_tweetImage}>
            <img src={props.image} alt='tweet' />
          </div>
        )}
      </div>
    </div>
  )
}

export default Post
