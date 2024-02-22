import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyBdU9Y2KDpvG6tvSzYrrlAZJ2RUpX3GKIY',
  authDomain: 'file-management-system-39da7.firebaseapp.com',
  projectId: 'file-management-system-39da7',
  storageBucket: 'file-management-system-39da7.appspot.com',
  messagingSenderId: '150415198400',
  appId: '1:150415198400:web:5b049796c0947eae98c525',
  //measurementId: "G-KR294CJDRB"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
