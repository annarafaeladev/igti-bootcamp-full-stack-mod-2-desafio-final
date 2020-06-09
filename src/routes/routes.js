const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

const pathJson = path.resolve(__dirname, "../", "grades.json");

async function readFileJson() {
  try {
    let fileJson = await fs.readFile(pathJson, "utf8");
    fileJson = JSON.parse(fileJson);
    return fileJson;
  } catch (err) {
    return err;
  }
}

router.get("/grade/index", async (_, res) => {
  try {
    let fileJson = await readFileJson();
    return res.json({ ok: true, result: fileJson });
  } catch (error) {
    return res.json({ ok: false, result: null });
  }
});

router.post("/grade/create", async (req, res) => {
  const { student, subject, type, value } = req.body;
  try {
    let fileJson = await readFileJson();
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
    let fileJson = await readFileJson();
    let index = fileJson.grades.findIndex((grade) => grade.id === id);
    if (index) {
      (fileJson.grades[index].student = student
        ? student
        : fileJson.grades[index].student),
        (fileJson.grades[index].subject = subject
          ? subject
          : fileJson.grades[index].subject),
        (fileJson.grades[index].type = type
          ? type
          : fileJson.grades[index].type),
        (fileJson.grades[index].value = value
          ? value
          : fileJson.grades[index].value),
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
    let fileJson = await readFileJson();

    let data = fileJson.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );

    fileJson.grades = data;
    await fs.writeFile(pathJson, JSON.stringify(fileJson));

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
    let fileJson = await fs.readFile(pathJson, "utf8");
    fileJson = JSON.parse(fileJson);
    let data = fileJson.grades.filter((grade) => grade.id === parseInt(id, 10));

    if (data.length > 0) {
      res.json({
        ok: true,
        message: "Success",
        grade: data,
      });
    }

    // return res.json({
    //   ok: false,
    //   message: "Not Found id",
    //   grade: null,
    // });
  } catch (error) {
    return res.json({
      ok: false,
      message: "Not Found id",
      grade: null,
    });
  }
});

router.get("/soma", async (req, res) => {
  const { student, subject } = req.query;
  try {
    let fileJson = await readFileJson();
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
  } catch (error) {
    res.json({
      ok: false,
      result: null,
    });
  }
});

router.get("/media", async (req, res) => {
  const { type, subject } = req.query;
  try {
    let fileJson = await readFileJson();
    let typeParam = fileJson.grades.filter((grade) => grade.type === type);
    let sum = 0;
    let count = 0;
    let subjectType = typeParam.filter((grade) => {
      if (grade.subject === subject) {
        count++;
        return (sum += grade.value);
      }
    });

    res.json({
      ok: true,
      subject: subjectType,
      result: `Média: ${subject} do tipo ${type}=  ${sum / count}`,
    });
  } catch (error) {
    res.json({
      ok: false,
      result: null,
    });
  }
});

router.get("/melhor-grade", async (req, res) => {
  const { type, subject } = req.query;
  try {
    let fileJson = await readFileJson();

    let typeData = fileJson.grades.filter((grade) => grade.type === type);

    let subjectData = typeData.filter((grade) => grade.subject === subject);
    subjectData = subjectData.sort((a, b) => b.value - a.value);

    let initialID = 1;
    let result = [];
    subjectData.filter((grade) => {
      if (initialID < 4) {
        result.push({ ...grade });
        initialID++;
      }
    });

    res.json({
      ok: true,
      result: result,
    });
  } catch (error) {
    res.json({
      ok: false,
      result: null,
    });
  }
});
module.exports = router;
