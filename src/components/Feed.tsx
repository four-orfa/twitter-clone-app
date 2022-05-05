import { useEffect, useState } from 'react'
import { db } from '../firebase'

import TweetInput from './TweetInput'

import styles from './Feed.module.css'
import Post from './Post'

const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      id: '',
      displayName: '',
      avatar: '',
      image: '',
      text: '',
      timestamp: null,
    },
  ])

  useEffect(() => {
    const unSub = db
      .collection('posts')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            image: doc.data().image,
            text: doc.data().text,
            timestamp: doc.data().timestamp,
            displayName: doc.data().displayName,
          })),
        )
      })
    return () => {
      unSub()
    }
  }, [])

  return (
    <div className={styles.feed}>
      <TweetInput />
      {posts[0]?.id && (
        <>
          {posts.map((post) => (
            <Post
              key={post.id}
              id={post.id}
              avatar={post.avatar}
              image={post.image}
              text={post.text}
              timestamp={post.timestamp}
              displayName={post.displayName}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default Feed
