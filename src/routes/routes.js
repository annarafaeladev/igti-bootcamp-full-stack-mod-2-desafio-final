const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

const pathJson = path.resolve(__dirname, "grades.json");

router.get("/grade/index", async (_, res) => {
  try {
    let fileJson = null;
    fileJson = await fs.readFile(pathJson);
    fileJson = JSON.parse(fileJson);
    return res.json({ ok: true, result: fileJson });
  } catch (error) {
    return res.json({ ok: false, result: null });
  }
});

router.post("/grade/create", async (req, res) => {
  const { student, subject, type, value } = req.body;
  try {
    let fileJson = null;
    fileJson = await fs.readFile(pathJson, "utf8");
    fileJson = JSON.parse(fileJson);
    let data = {
      id: fileJson.nextId++,
      student: student,
      subject: subject,
      value: value,
      type: type,
      timestamp: new Date(),
    };
    fileJson.grades.push(data);
    fs.writeFile(pathJson, JSON.stringify(fileJson));
    res.json({
      ok: true,
      message: "Success",
      grade: data,
    });
  } catch (error) {
    return res.json({
      ok: false,
      message: "Failed create grade",
      grade: null,
    });
  }
});

router.put("/grade/edit", async (req, res) => {
  const { student, subject, type, value, id } = req.body;
  try {
    let fileJson = null;
    fileJson = await fs.readFile(pathJson, "utf8");
    fileJson = JSON.parse(fileJson);
    let index = fileJson.grades.findIndex((grade) => grade.id === id);
    if (index) {
      (fileJson.grades[index].student = student),
        (fileJson.grades[index].subject = subject),
        (fileJson.grades[index].type = type),
        (fileJson.grades[index].value = value),
        await fs.writeFile(pathJson, JSON.stringify(fileJson));
      res.json({
        ok: true,
        message: "Edited Success",
      });
    }
  } catch (error) {
    return res.json({ ok: false, message: "Failed", grade: null });
  }
});

router.delete("/grade/delete/:id", async (req, res) => {
  try {
    let fileJson = null;
    fileJson = await fs.readFile(pathJson, "utf8");
    fileJson = JSON.parse(fileJson);
    let data = fileJson.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );

    await fs.writeFile(pathJson, JSON.stringify(data));
    res.json({
      ok: true,
      message: "Removed Success",
    });
  } catch (error) {
    return res.json({ ok: false, message: "id not foud" });
  }
});

router.get("/grade/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let fileJson = null;
    fileJson = await fs.readFile(pathJson, "utf8");
    fileJson = JSON.parse(fileJson);
    let data = fileJson.grades.filter((grade) => grade.id === parseInt(id, 10));

    if (data.length > 0) {
      res.json({
        ok: true,
        message: "Success",
        grade: data,
      });
    }

    return res.json({
      ok: false,
      message: "Not Found id",
      grade: null,
    });
  } catch (error) {
    return res.json({
      ok: false,
      message: "Not Found id",
      grade: null,
    });
  }
});

router.get("/teste", async (req, res) => {
  const { student, subject } = req.query;
  let fileJson = null;
  fileJson = await fs.readFile(pathJson, "utf8");
  fileJson = JSON.parse(fileJson);

  let studentName = fileJson.grades.filter(
    (grade) => grade.student === student
  );

  let sum = 0;

  let subjectStudent = studentName.filter((student) => {
    if (student.subject === subject) {
      return (sum += student.value);
    }
  });

  res.json({
    ok: true,
    subject: subjectStudent,
    result: `Soma das notas subject: ${subject} =  ${sum}`,
  });
});

module.exports = router;
