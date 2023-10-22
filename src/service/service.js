const express = require("express");
const { firebaseFirestore } = require("../../firebase");
const {
  doc,
  setDoc,
  addDoc,
  collection,
  deleteDoc,
} = require("firebase/firestore");

const app = express();

app.post("/add", async (req, res) => {
  try {
    if (
      !req.body.collection ||
      typeof req.body.collection !== "string" ||
      !req.body.document ||
      typeof req.body.document !== "object"
    ) {
      return res.status(400).send("Falta de Campos o Datos Inválidos");
    }

    const dbRef = collection(firebaseFirestore, req.body.collection);

    const documentData = {
      ...req.body.document,
      created_at: new Date(),
    };

    await addDoc(dbRef, documentData).then((result) => {
      res.status(200).send("Documento agregado exitosamente");
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).send("Ocurrió un error al agregar el documento");
  }
});

app.put("/update", async (req, res) => {
  try {
    if (
      !req.body.collection ||
      typeof req.body.collection !== "string" ||
      !req.body.document ||
      typeof req.body.document !== "object"
    ) {
      return res.status(400).send("Falta de Campos o Datos Inválidos");
    }

    await setDoc(doc(firebaseFirestore, req.body.collection, req.body.id), {
      ...req.body.document,
      updated_at: new Date(),
    })
      .then(() => {
        res.status(200).send(`Documento actualizado Exitosamente`);
      })
      .catch((error) => {
        res.status(500).send(`Error: ${error}`);
      });
  } catch (error) {
    console.error(`Error: ${error}`);
    res.status(500).send("Ocurrió un error al modificar el documento");
  }
});

app.delete("/delete", async (req, res) => {
  if (
    req.body.id == undefined ||
    req.body.id == "" ||
    req.body.collection == undefined ||
    req.body.collection == ""
  ) {
    res.status(400).send("Falta de Campos");
    return;
  }
  await deleteDoc(doc(firebaseFirestore, req.body.collection, req.body.id))
    .then(() => {
      res.status(200).send(`Documento Eliminado Exitosamente`);
    })
    .catch((error) => {
      res.status(500).send(`Error: ${error}`);
    });
});

module.exports = app;
