const express = require("express");
const multer = require("multer");
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
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

const upload = multer();
const app = express();

app.post("/saveImage", upload.single("upl"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Falta de Campos" });
      return;
    }
    const fileExtension = req.file.originalname.split(".").pop();

    // const modifiedFileName = `${req.file.originalname}`;

    const storage = getStorage();
    const storageRef = ref(
      storage,
      `invoices/${generateUUID()}.${fileExtension}`
    );

    await uploadBytes(storageRef, req.file.buffer).then(async (data) => {
      await getDownloadURL(storageRef).then((downloadURL) => {
        res.status(200).json({ message: 'Archivo subido con éxito', url: downloadURL });
      });
    });
  } catch (error) {
    console.error("Error durante la carga del archivo:", error);
    res.status(400).json({ error: "Error interno del servidor" });
  }
});

function generateUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}

app.post("/add", async (req, res) => {
  try {
    if (
      !req.body.collection ||
      typeof req.body.collection !== "string" ||
      !req.body.document ||
      typeof req.body.document !== "object"
    ) {
      return res
        .status(400)
        .json({ error: "Falta de Campos o Datos Inválidos" });
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
    res.status(400).json({ error: "Ocurrió un error al agregar el documento" });
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
      return res
        .status(400)
        .json({ error: "Falta de Campos o Datos Inválidos" });
    }

    await setDoc(doc(firebaseFirestore, req.body.collection, req.body.id), {
      ...req.body.document,
      updated_at: new Date(),
    })
      .then(() => {
        res.status(200).json({ result: `Documento actualizado Exitosamente` });
      })
      .catch((error) => {
        res.status(400).json({ error: `Error: ${error}` });
      });
  } catch (error) {
    console.error(`Error: ${error}`);
    res
      .status(400)
      .json({ error: "Ocurrió un error al modificar el documento" });
  }
});

app.delete("/delete", async (req, res) => {
  if (
    req.body.id == undefined ||
    req.body.id == "" ||
    req.body.collection == undefined ||
    req.body.collection == ""
  ) {
    res.status(400).json({ error: "Falta de Campos" });
    return;
  }
  await deleteDoc(doc(firebaseFirestore, req.body.collection, req.body.id))
    .then(() => {
      res.status(200).json({ result: `Documento Eliminado Exitosamente` });
    })
    .catch((error) => {
      res.status(400).json({ error: `Error: ${error}` });
    });
});

app.post("/getDoc", async (req, res) => {
  if (
    req.body.id == undefined ||
    req.body.id == "" ||
    req.body.collection == undefined ||
    req.body.collection == ""
  ) {
    res.status(400).json({ error: "Falta de Campos" });
    return;
  }

  const docRef = doc(firebaseFirestore, req.body.collection, req.body.id);
  await getDoc(docRef)
    .then((data) => {
      if (data.data() == undefined) {
        res.status(400).json({ error: "No se encontró ningun Documento" });
      } else {
        res.status(200).json({ id: data.id, ...data.data() });
      }
    })
    .catch((error) => {
      res.status(400).json({ error: error });
    });
});

app.post("/getCollection", async (req, res) => {
  if (req.body.collection == undefined || req.body.collection == "") {
    res.status(400).json({ error: "Falta de Campos" });
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
      res.status(400).json({ error: error });
    });
});

app.post("/getDocsFilter", async (req, res) => {
  if (req.body.collection == undefined || req.body.collection == "") {
    res.status(400).json({ error: "Falta de Campos" });
    return;
  }

  if (
    req.body.filter == undefined ||
    !Array.isArray(req.body.filter) ||
    req.body.filter.length == 0
  ) {
    res
      .status(400)
      .json({ error: "Estructura del arreglo filtros incorrecta o vacia" });
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
      res.status(400).json({ error: error });
    });
});

module.exports = app;
