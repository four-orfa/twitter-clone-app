import { useState } from 'react'
import styles from './TweetInput.module.css'
import { useSelector } from 'react-redux'
import { selectUser } from '../features/userSlice'
import { auth, db, storage } from '../firebase'
import { Avatar, Button, IconButton } from '@material-ui/core'
import firebase from 'firebase/app'
import AddAPhoto from '@material-ui/icons/AddAPhoto'

const TweetInput: React.FC = () => {
  const user = useSelector(selectUser)

  const [tweetImage, setTweetImage] = useState<File | null>(null)
  const [tweetMessage, setTweetMessage] = useState('')

  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTweetImage(e.target.files![0])
    e.target.value = ''
  }
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (tweetImage) {
      // make unique randomChar
      const S = 'abcdefghijklnmopqrstuvwxyzABCDEFGHIJKLNMOPQRSTUVWXYZ0123456789'
      const N = 16
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('')

      const fileName = randomChar + '_' + tweetImage.name
      const uploadTweetImage = storage.ref(`images/${fileName}`).put(tweetImage)
      uploadTweetImage.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {},
        (err: any) => {
          alert(err.message)
        },
        async () => {
          await storage
            .ref('images')
            .child(fileName)
            .getDownloadURL()
            .then(async (url) => {
              await db.collection('posts').add({
                avatar: user.photoURL,
                image: url,
                text: tweetMessage,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                displayName: user.displayName,
              })
            })
        },
      )
    } else {
      db.collection('posts').add({
        avatar: user.photoURL,
        image: '',
        text: tweetMessage,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        displayName: user.displayName,
      })
    }
  }
  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoURL}
            onClick={async () => {
              await auth.signOut()
            }}
          />
          <input
            type='text'
            className={styles.tweet_input}
            placeholder={"What's happening?"}
            autoFocus
            value={tweetMessage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTweetMessage(e.target.value)}
          />
          <IconButton>
            <label>
              <AddAPhoto className={tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon} />
              <input type='file' className={styles.tweet_hiddenIcon} onChange={onChangeImageHandler} />
            </label>
          </IconButton>
        </div>
        <Button
          type='submit'
          disabled={!tweetMessage}
          className={tweetMessage ? styles.tweet_sendButton : styles.tweet_sendDisableButton}
        >
          tweet
        </Button>
      </form>
    </>
  )
}
export default TweetInput
