"use client";

import { useEffect, useMemo, useState } from "react";

import StudentModal from "./components/StudentModal";
import { courses } from "./data/courses";
import { Student } from "./types";
import { loadStudents, saveStudents } from "./utils/storage";

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

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
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

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-indigo-500 md:w-80"
          />
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
                    <td className="p-4 font-bold text-indigo-700">
                      {student.total}/{maxTotal}
                    </td>

                    {/* PERCENTAGE */}
                    <td className="p-4 font-bold text-indigo-600">
                      {student.percentage.toFixed(1)}%
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setOpenModal(true);
                          }}
                          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          Voir
                        </button>

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
