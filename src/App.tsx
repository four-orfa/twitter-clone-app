import React, { useEffect } from 'react'
import styles from './App.module.css'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, login, logout } from './features/userSlice'
import { auth } from './firebase'
import Feed from './components/Auth'
import Auth from './components/Feed'

const App: React.FC = () => {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()

  useEffect(() => {
    const unSub = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(
          login({
            uid: authUser.uid,
            photoURL: authUser.photoURL,
            displayName: authUser.displayName,
          }),
        )
      } else {
        dispatch(logout())
      }
    })

    return () => {
      unSub()
    }
  }, [dispatch])
  console.log(user)
  return (
    <>
      {user.uid ? (
        <Auth />
      ) : (
        <div className={styles.app}>
          <Feed />
        </div>
      )}
    </>
  )
}

export default App
