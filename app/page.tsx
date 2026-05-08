"use client";

import { useEffect, useMemo, useState } from "react";

import StudentModal from "./components/StudentModal";
import { courses } from "./data/courses";
import { Student } from "./types";
import { loadStudents, saveStudents } from "./utils/storage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Home() {
  /* =========================
     STATES
  ========================= */

  const [students, setStudents] = useState<Student[]>([]);
  const [studentName, setStudentName] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);

  const [editingMarks, setEditingMarks] = useState<Record<string, number>>({});

  /* =========================
     TOTAL MAX
  ========================= */

  const maxTotal = useMemo(() => {
    return courses.reduce((acc, course) => acc + course.max, 0);
  }, []);

  /* =========================
     LOAD STUDENTS
  ========================= */

  useEffect(() => {
    const storedStudents = loadStudents();
    setStudents(storedStudents);
  }, []);

  /* =========================
     SAVE STUDENTS
  ========================= */

  useEffect(() => {
    saveStudents(students);
  }, [students]);

  /* =========================
     HANDLE MARK CHANGE
  ========================= */

  const handleMarkChange = (course: string, value: string) => {
    setMarks((prev) => ({
      ...prev,
      [course]: value,
    }));
  };

  /* =========================
     ADD STUDENT
  ========================= */

  const handleAddStudent = () => {
    if (!studentName.trim()) {
      alert("Please enter student name");
      return;
    }

    let total = 0;

    const formattedMarks: Record<string, number> = {};

    courses.forEach((course) => {
      let value = Number(marks[course.name] || 0);

      // Prevent values above max
      if (value > course.max) {
        value = course.max;
      }

      formattedMarks[course.name] = value;

      total += value;
    });

    const percentage = (total / maxTotal) * 100;

    const newStudent: Student = {
      id: Date.now(),
      name: studentName,
      marks: formattedMarks,
      total,
      percentage,
    };

    setStudents((prev) => [...prev, newStudent]);

    // RESET FORM
    setStudentName("");
    setMarks({});
  };

  /* =========================
   START EDIT
========================= */

  const handleEditStudent = (student: Student) => {
    setEditingStudentId(student.id);

    setEditingMarks(student.marks);
  };

  /* =========================
   SAVE EDIT
========================= */

  const handleSaveEdit = (studentId: number) => {
    const updatedStudents = students.map((student) => {
      if (student.id !== studentId) return student;

      let total = 0;

      const updatedMarks: Record<string, number> = {};

      courses.forEach((course) => {
        let value = Number(editingMarks[course.name] || 0);

        if (value > course.max) {
          value = course.max;
        }

        updatedMarks[course.name] = value;

        total += value;
      });

      const percentage = (total / maxTotal) * 100;

      return {
        ...student,
        marks: updatedMarks,
        total,
        percentage,
      };
    });

    setStudents(updatedStudents);

    // localStorage auto updates because of useEffect

    setEditingStudentId(null);
    setEditingMarks({});
  };

  /* =========================
     DELETE STUDENT
  ========================= */

  const handleDeleteStudent = (id: number) => {
    const filteredStudents = students.filter((student) => student.id !== id);

    setStudents(filteredStudents);

    if (selectedStudent?.id === id) {
      setSelectedStudent(null);
      setOpenModal(false);
    }
  };

  /* =========================
     FILTERED STUDENTS
  ========================= */

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* =========================
   GENERATE PDF
========================= */

  const generateProclamationPDF = () => {
    const doc = new jsPDF("landscape");

    // =========================
    // COLORS
    // =========================

    const primary: [number, number, number] = [79, 70, 229];
    const secondary: [number, number, number] = [99, 102, 241];
    const success: [number, number, number] = [22, 163, 74];
    const danger: [number, number, number] = [220, 38, 38];

    // =========================
    // SORT STUDENTS BY %
    // =========================

    const sortedStudents = [...students].sort(
      (a, b) => b.percentage - a.percentage,
    );

    // =========================
    // HEADER BACKGROUND
    // =========================

    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(0, 0, 300, 35, "F");

    // =========================
    // SCHOOL NAME
    // =========================

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");

    doc.text("COMPLEXE SCOLAIRE UN JOUR NOUVEAU", 14, 15);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.text("Liste officielle de proclamation des élèves", 14, 25);

    // =========================
    // DATE
    // =========================

    const date = new Date().toLocaleDateString();

    doc.text(`Date: ${date}`, 240, 25);

    // =========================
    // RESET TEXT COLOR
    // =========================

    doc.setTextColor(0, 0, 0);

    // =========================
    // STATISTICS BOXES
    // =========================

    const passedStudents = students.filter(
      (student) => student.percentage >= 50,
    ).length;

    const failedStudents = students.length - passedStudents;

    // TOTAL BOX
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(14, 45, 55, 22, 3, 3, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL ÉLÈVES", 18, 54);

    doc.setFontSize(18);
    doc.text(String(students.length), 18, 63);

    // PASSED BOX
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(80, 45, 55, 22, 3, 3, "F");

    doc.setFontSize(11);
    doc.text("RÉUSSITE", 84, 54);

    doc.setTextColor(success[0], success[1], success[2]);

    doc.setFontSize(18);
    doc.text(String(passedStudents), 84, 63);

    // FAILED BOX
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(146, 45, 55, 22, 3, 3, "F");

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    doc.text("ÉCHEC", 150, 54);

    doc.setTextColor(danger[0], danger[1], danger[2]);

    doc.setFontSize(18);
    doc.text(String(failedStudents), 150, 63);

    // RESET TEXT COLOR
    doc.setTextColor(0, 0, 0);

    // =========================
    // TABLE HEAD
    // =========================

    const tableHead = [
      [
        "#",
        "Nom",
        ...courses.map((course) => `${course.name}`),
        "Total",
        "%",
        "Décision",
      ],
    ];

    // =========================
    // TABLE BODY
    // =========================

    const tableBody = sortedStudents.map((student, index) => [
      index + 1,

      student.name,

      ...courses.map((course) => `${student.marks[course.name]}/${course.max}`),

      `${student.total}/${maxTotal}`,

      `${student.percentage.toFixed(1)}%`,

      student.percentage >= 50 ? "Réussi" : "Échec",
    ]);

    // =========================
    // TABLE
    // =========================

    autoTable(doc, {
      startY: 80,

      head: tableHead,

      body: tableBody,

      theme: "grid",

      styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
      },

      headStyles: {
        fillColor: secondary,
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },

      bodyStyles: {
        textColor: [30, 41, 59],
      },

      didParseCell: (data) => {
        // PASS/FAIL COLORS
        if (
          data.column.index === tableHead[0].length - 1 &&
          data.section === "body"
        ) {
          if (data.cell.raw === "Réussi") {
            data.cell.styles.textColor = success;
          } else {
            data.cell.styles.textColor = danger;
          }

          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // =========================
    // FOOTER
    // =========================

    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(10);

    doc.text(
      "Document généré automatiquement par le système scolaire",
      14,
      pageHeight - 10,
    );

    doc.text("Signature du Directeur", 240, pageHeight - 10);

    // =========================
    // SAVE
    // =========================

    doc.save("proclamation-professionnelle.pdf");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800">
              Student Result Dashboard
            </h1>

            <p className="mt-2 text-slate-500">
              Manage student marks and percentages easily
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            {/* PDF BUTTON */}
            <button
              onClick={generateProclamationPDF}
              className="rounded-xl bg-green-600 px-5 py-3 font-bold text-white hover:bg-green-700"
            >
              Télécharger PDF
            </button>

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-indigo-500 md:w-80"
            />
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-slate-800">
            Add Student Results
          </h2>

          {/* STUDENT NAME */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* COURSES */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.name}
                className="rounded-2xl border bg-slate-50 p-4"
              >
                <div className="mb-3">
                  <h3 className="font-bold text-slate-800">{course.name}</h3>

                  <p className="text-sm text-slate-500">
                    Max: {course.max} • Pass: {course.pass}
                  </p>
                </div>

                <input
                  type="number"
                  min={0}
                  max={course.max}
                  value={marks[course.name] || ""}
                  placeholder={`/${course.max}`}
                  onChange={(e) =>
                    handleMarkChange(course.name, e.target.value)
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* BUTTON */}
          <button
            onClick={handleAddStudent}
            className="mt-8 rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white transition hover:bg-indigo-700"
          >
            Add Student
          </button>
        </div>

        {/* TABLE */}
        <div className="mt-10 overflow-x-auto rounded-3xl bg-white shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-4 text-left">Student</th>

                {courses.map((course) => (
                  <th key={course.name} className="p-4 text-left text-sm">
                    <div>
                      <p>{course.name}</p>

                      <p className="text-xs font-normal text-indigo-100">
                        /{course.max}
                      </p>
                    </div>
                  </th>
                ))}

                <th className="p-4 text-left">Total</th>
                <th className="p-4 text-left">%</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={courses.length + 4}
                    className="p-6 text-center text-slate-500"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b transition hover:bg-slate-50"
                  >
                    {/* NAME */}
                    <td className="p-4 font-bold">{student.name}</td>

                    {/* MARKS */}
                    {courses.map((course) => {
                      const mark =
                        editingStudentId === student.id
                          ? editingMarks[course.name]
                          : student.marks[course.name];

                      const passed = mark >= course.pass;

                      return (
                        <td key={course.name} className="p-4">
                          {editingStudentId === student.id ? (
                            <input
                              type="number"
                              min={0}
                              max={course.max}
                              value={editingMarks[course.name] || 0}
                              onChange={(e) =>
                                setEditingMarks((prev) => ({
                                  ...prev,
                                  [course.name]: Number(e.target.value),
                                }))
                              }
                              className="w-20 rounded-lg border p-2"
                            />
                          ) : (
                            <span
                              className={`font-semibold ${
                                passed ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {mark}/{course.max}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* TOTAL */}
                    <td className="p-4 font-bold text-indigo-700">
                      {student.total}/{maxTotal}
                    </td>

                    {/* PERCENTAGE */}
                    <td className="p-4 font-bold text-indigo-600">
                      {student.percentage.toFixed(1)}%
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setOpenModal(true);
                          }}
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Voir
                        </button>

                        {editingStudentId === student.id ? (
                          <button
                            onClick={() => handleSaveEdit(student.id)}
                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <StudentModal
        open={openModal}
        student={selectedStudent}
        onClose={() => setOpenModal(false)}
      />
    </main>
  );
}
