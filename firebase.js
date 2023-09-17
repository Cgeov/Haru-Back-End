// Import the functions you need from the SDKs you need
const  {initializeApp} = require("firebase/app");
const { getAuth } = require("firebase/auth");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFybyjqWtx0tNqErMz01U01RH5yFj1EzE",
  authDomain: "haru-c4c01.firebaseapp.com",
  projectId: "haru-c4c01",
  storageBucket: "haru-c4c01.appspot.com",
  messagingSenderId: "737533328997",
  appId: "1:737533328997:web:3ead6c65451f16bb83908c"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = {
  firebaseApp: app,
  firebaseAuth: auth,
};