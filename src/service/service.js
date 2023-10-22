const express = require("express");
const { firebaseFirestore } = require("../../firebase");
const {
  doc,
  setDoc,
  addDoc,
  collection,
  deleteDoc,
  getDoc,
  getDocs,
  where,
  query,
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
      res
        .status(200)
        .json({ result: "Documento agregado exitosamente", id: result.id });
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
        res.status(200).json({ result: `Documento actualizado Exitosamente` });
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
      res.status(200).json({ result: `Documento Eliminado Exitosamente` });
    })
    .catch((error) => {
      res.status(500).send(`Error: ${error}`);
    });
});

app.get("/getDoc", async (req, res) => {
  if (
    req.body.id == undefined ||
    req.body.id == "" ||
    req.body.collection == undefined ||
    req.body.collection == ""
  ) {
    res.status(400).send("Falta de Campos");
    return;
  }

  const docRef = doc(firebaseFirestore, req.body.collection, req.body.id);
  await getDoc(docRef)
    .then((data) => {
      if (data.data() == undefined) {
        res.status(400).send("No se encontró ningun Documento");
      } else {
        res.status(200).json({ id: data.id, ...data.data() });
      }
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.get("/getCollection", async (req, res) => {
  if (req.body.collection == undefined || req.body.collection == "") {
    res.status(400).send("Falta de Campos");
    return;
  }
  await getDocs(collection(firebaseFirestore, req.body.collection))
    .then((querySnapshot) => {
      let data = [];
      if (querySnapshot.size > 0) {
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
      }
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

app.get("/getDocsFilter", async (req, res) => {
  if (req.body.collection == undefined || req.body.collection == "") {
    res.status(400).send("Falta de Campos");
    return;
  }

  if (
    req.body.filter == undefined ||
    !Array.isArray(req.body.filter) ||
    req.body.filter.length == 0
  ) {
    res.status(400).send("Estructura del arreglo filtros incorrecta o vacia");
    return;
  }

  let queryConstraints = [];

  if (req.body.filter && Array.isArray(req.body.filter)) {
    req.body.filter.forEach((filter) => {
      if (filter.field && filter.comparison && filter.value) {
        queryConstraints.push(
          where(filter.field, filter.comparison, filter.value)
        );
      }
    });
  }

  const q = query(
    collection(firebaseFirestore, req.body.collection),
    ...queryConstraints
  );
  await getDocs(q)
    .then((querySnapshot) => {
      let data = [];
      if (querySnapshot.size > 0) {
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
      }
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

module.exports = app;
