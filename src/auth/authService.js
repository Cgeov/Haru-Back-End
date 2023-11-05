const express = require("express");
const { firebaseAuth, firebaseFirestore } = require("../../firebase");
const { doc, setDoc, getDoc } = require("firebase/firestore");
const {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} = require("firebase/auth");

const app = express();

app.post("/sign-in", (req, res) => {
  if (
    req.body.email == undefined ||
    req.body.password == undefined ||
    req.body.email == "" ||
    req.body.password == ""
  ) {
    res.status(400).json({ error: "Faltan Campos" });
    return;
  }
  console.log(req.body.email, req.body.password);
  signInWithEmailAndPassword(firebaseAuth, req.body.email, req.body.password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      const docRef = doc(firebaseFirestore, "accounts", user.uid);
      await getDoc(docRef).then((data) => {
        res.status(200).json(data.data());
      });
    })
    .catch((error) => {
      res
        .status(400)
        .json({ error: `Error de autenticación: ${error.message}` });
    });
});

app.post("/sign-up", (req, res) => {
  if (
    req.body.name == undefined ||
    req.body.lastname == undefined ||
    req.body.name == "" ||
    req.body.lastname == ""
  ) {
    res.status(400).json({ error: "Faltan Campos" });
    return;
  }

  createUserWithEmailAndPassword(
    firebaseAuth,
    req.body.email,
    req.body.password
  )
    .then(async (userCredential) => {
      await setDoc(
        doc(firebaseFirestore, "accounts", userCredential.user.uid),
        {
          id: userCredential.user.uid,
          name: req.body.name,
          lastname: req.body.lastname,
          typeUser: "client",
          email: req.body.email,
          created_at: new Date(),
        }
      ).catch((error) => {
        res.status(400).send({ error: `Error: ${error}` });
      });
      res.status(200).json({
        id: userCredential.user.uid,
        name: req.body.name,
        lastname: req.body.lastname,
        typeUser: "client",
        email: req.body.email,
        created_at: new Date(),
      });
    })
    .catch((error) => {
      if (error.code == "auth/email-already-in-use") {
        res.status(400).json({ error: "Email Ingresado previamente" });
      } else {
        res
          .status(400)
          .json({ error: `Error de Registro de usuario: ${error.message}` });
      }
    });
});

app.post("/logout", (req, res) => {
  try {
    signOut(firebaseAuth)
      .then(() => {
        res.status(200).json({ error: "Se cerró sesión" });
      })
      .catch((error) => {
        res
          .status(400)
          .json({ error: `Error al cerrar sesión ${error.message}` });
      });
  } catch (error) {
    res.status(400).json({ error: `Error al cerrar sesión ${error}` });
  }
});

app.post("/verify-auth", (req, res) => {
  try {
    onAuthStateChanged(email)
      .then((user) => {
        if (user) {
          res.status(200).send({ auth: true });
        } else {
          res.status(200).send({ auth: false });
        }
      })
      .catch((error) => {
        res.status(400).send(`Error al validar sesión ${error.message}`);
      });
  } catch (error) {
    res.status(400).send(`Error: ${error}`);
  }
});

module.exports = app;
