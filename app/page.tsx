"use client";

import { useState } from "react";

/* =========================
   COURSES WITH MAX MARKS
========================= */

const courses = [
  {
    name: "Exp. Orale & Vocabulaire",
    max: 10,
    pass: 5,
  },
  {
    name: "Grammaire & Conjugaison",
    max: 10,
    pass: 5,
  },
  {
    name: "Orthographe & Dictée",
    max: 5,
    pass: 3,
  },
  {
    name: "Lecture",
    max: 25,
    pass: 12,
  },
  {
    name: "Expression Écrite",
    max: 30,
    pass: 15,
  },
  {
    name: "Numération",
    max: 10,
    pass: 5,
  },
  {
    name: "Opérations",
    max: 10,
    pass: 5,
  },
  {
    name: "Mesures de Grandeurs",
    max: 10,
    pass: 5,
  },
  {
    name: "Formes Géométriques",
    max: 10,
    pass: 5,
  },
  {
    name: "Problèmes",
    max: 20,
    pass: 10,
  },
  {
    name: "Sciences",
    max: 10,
    pass: 5,
  },
  {
    name: "Technologie",
    max: 20,
    pass: 10,
  },
  {
    name: "Éducation Civique",
    max: 10,
    pass: 5,
  },
  {
    name: "Éducation Sanitaire",
    max: 10,
    pass: 5,
  },
  {
    name: "Géographie",
    max: 10,
    pass: 5,
  },
  {
    name: "Histoire",
    max: 10,
    pass: 5,
  },
  {
    name: "Arts Plastiques",
    max: 10,
    pass: 5,
  },
  {
    name: "Arts Dramatiques",
    max: 10,
    pass: 5,
  },
  {
    name: "Éducation Physique",
    max: 10,
    pass: 5,
  },
  {
    name: "Religion",
    max: 10,
    pass: 5,
  },
];

/* =========================
   TYPES
========================= */

type Student = {
  id: number;
  name: string;
  marks: Record<string, number>;
  total: number;
  percentage: number;
};

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);

  const [studentName, setStudentName] = useState("");

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [openModal, setOpenModal] = useState(false);

  /* =========================
     HANDLE CHANGE
  ========================= */

  const handleMarkChange = (course: string, value: string) => {
    setMarks({
      ...marks,
      [course]: value,
    });
  };

  /* =========================
     ADD STUDENT
  ========================= */

  const handleAddStudent = () => {
    if (!studentName) {
      alert("Enter student name");
      return;
    }

    let total = 0;

    const formattedMarks: Record<string, number> = {};

    courses.forEach((course) => {
      const value = Number(marks[course.name] || 0);

      formattedMarks[course.name] = value;

      total += value;
    });

    const maxTotal = courses.reduce((acc, course) => acc + course.max, 0);

    const percentage = (total / maxTotal) * 100;

    const newStudent: Student = {
      id: Date.now(),
      name: studentName,
      marks: formattedMarks,
      total,
      percentage,
    };

    setStudents([...students, newStudent]);

    // RESET
    setStudentName("");
    setMarks({});
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800">
            Student Result Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Manage student marks and generate percentages automatically.
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-3xl bg-white p-8 shadow-lg">
          <h2 className="mb-8 text-2xl font-bold">Add Student Results</h2>

          {/* NAME */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* COURSES */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.name}
                className="rounded-2xl border bg-slate-50 p-4"
              >
                <div className="mb-3">
                  <h3 className="font-bold text-slate-800">{course.name}</h3>

                  <p className="text-sm text-slate-500">
                    Max: {course.max} • Pass:
                    {course.pass}
                  </p>
                </div>

                <input
                  type="number"
                  min={0}
                  max={course.max}
                  placeholder={`/${course.max}`}
                  value={marks[course.name] || ""}
                  onChange={(e) =>
                    handleMarkChange(course.name, e.target.value)
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>

          {/* BUTTON */}
          <div className="mt-10">
            <button
              onClick={handleAddStudent}
              className="rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white transition hover:bg-indigo-700"
            >
              Add Student
            </button>
          </div>
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
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={courses.length + 3}
                    className="p-6 text-center text-slate-500"
                  >
                    No students added yet
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-slate-50">
                    {/* NAME */}
                    <td className="p-4 font-bold">{student.name}</td>

                    {/* MARKS */}
                    {courses.map((course) => {
                      const mark = student.marks[course.name];

                      const passed = mark >= course.pass;

                      return (
                        <td
                          key={course.name}
                          className={`p-4 font-semibold ${
                            passed ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {mark}/{course.max}
                        </td>
                      );
                    })}

                    {/* TOTAL */}
                    {/* TOTAL */}
                    <td className="p-4 font-bold text-indigo-700">
                      {student.total}/
                      {courses.reduce((acc, course) => acc + course.max, 0)}
                    </td>

                    {/* PERCENTAGE */}
                    <td className="p-4 font-bold text-indigo-600">
                      {student.percentage.toFixed(1)}%
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setOpenModal(true);
                        }}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        Voir Résultat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* MODAL */}
      {openModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            {/* HEADER */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-800">
                  Bulletin de l'Élève
                </h2>

                <p className="mt-1 text-slate-500">{selectedStudent.name}</p>
              </div>

              <button
                onClick={() => setOpenModal(false)}
                className="rounded-full bg-red-100 px-4 py-2 font-bold text-red-600 hover:bg-red-200"
              >
                X
              </button>
            </div>

            {/* STUDENT RESULT */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="p-4 text-left">Cours</th>

                    <th className="p-4 text-left">Note</th>

                    <th className="p-4 text-left">Maximum</th>

                    <th className="p-4 text-left">Passage</th>

                    <th className="p-4 text-left">Statut</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => {
                    const mark = selectedStudent.marks[course.name];

                    const passed = mark >= course.pass;

                    return (
                      <tr key={course.name} className="border-b">
                        <td className="p-4 font-medium">{course.name}</td>

                        <td className="p-4">{mark}</td>

                        <td className="p-4">{course.max}</td>

                        <td className="p-4">{course.pass}</td>

                        <td
                          className={`p-4 font-bold ${
                            passed ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {passed ? "Réussi" : "Échec"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-100 p-6">
                <h3 className="text-lg font-bold">Total</h3>

                <p className="mt-2 text-3xl font-extrabold text-indigo-600">
                  {selectedStudent.total}/
                  {courses.reduce((acc, course) => acc + course.max, 0)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-6">
                <h3 className="text-lg font-bold">Pourcentage</h3>

                <p className="mt-2 text-3xl font-extrabold text-emerald-600">
                  {selectedStudent.percentage.toFixed(1)}%
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-6">
                <h3 className="text-lg font-bold">Décision</h3>

                <p
                  className={`mt-2 text-3xl font-extrabold ${
                    selectedStudent.percentage >= 50
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {selectedStudent.percentage >= 50 ? "Réussi" : "Échec"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
