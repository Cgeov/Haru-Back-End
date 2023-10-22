const express = require("express");
const { firebaseAuth, firebaseFirestore } = require("../../firebase");
const { doc, setDoc } = require("firebase/firestore");
const {signInWithEmailAndPassword, createUserWithEmailAndPassword ,signOut, onAuthStateChanged  } = require("firebase/auth");

const app = express();

app.get('/sign-in', (req, res) => {
  if(req.body.email == undefined || req.body.password == undefined || req.body.email == "" || req.body.password == ""){
    res.status(400).send("Faltan Campos");
    return;
  }
  
  signInWithEmailAndPassword(firebaseAuth,req.body.email, req.body.password)
    .then(userCredential => {
      const user = userCredential.user;
      res.status(200).send(`¡Bienvenido, ${user.email}!`);
    })
    .catch(error => {
      res.status(500).send(`Error de autenticación: ${error.message}`);
    });
});

app.post('/sign-up', (req, res) => {
  if(req.body.name == undefined || req.body.lastname == undefined || req.body.name == "" || req.body.lastname == ""){
    res.status(400).send("Faltan Campos");
    return;
  }

  if(req.body.email == undefined || req.body.password == undefined || req.body.email == "" || req.body.password == ""){
    res.status(400).send("Faltan Campos");
    return;
  }
  
  createUserWithEmailAndPassword(firebaseAuth,req.body.email, req.body.password)
    .then(async(userCredential) => {
      const user = userCredential.user;
      await setDoc(doc(firebaseFirestore, "accounts", userCredential.user.uid), {
        id: userCredential.user.uid,
        name: req.body.name,
        lastname: req.body.name,
        typeUser: 'client',
        email: req.body.name,
        created_at: new Date(),
      }).catch((error)=>{
        res.status(500).send(`Error: ${error}`);
      });
      res.status(200).send('Usuario Creado');
    })
    .catch((error) => {
      if(error.code == 'auth/email-already-in-use'){
        res.status(400).send("Email Ingresado previamente");
      }else{
        res.status(500).send(`Error de Registro de usuario: ${error.message}`);
      }
    });
});

app.get('/logout', (req, res) => {
  try{
    signOut(firebaseAuth).then(()=>{
      res.status(200).send('Se cerró sesión');
    }).catch((error)=>{
      res.status(500).send(`Error al cerrar sesión ${error.message}`)
    })
  
  }catch(error){
    res.status(500).send(`Error al cerrar sesión ${error}`)
  }
});

app.get('/verify-auth', (req, res) => {
  try{
    onAuthStateChanged(email).then((user)=>{
      if(user){
        res.status(200).send({auth: true});
      }else{
        res.status(200).send({auth: false});
      }
      
    }).catch((error)=>{
      res.status(500).send(`Error al validar sesión ${error.message}`)
    })
  
  }catch(error){
    res.status(500).send(`Error: ${error}`)
  }
});


module.exports = app;




