"use client";

import { useEffect, useState } from "react";
import StudentModal from "./StudentModal";
import { courses } from "./data/courses";

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

  const maxTotal = courses.reduce((acc, c) => acc + c.max, 0);

  /* =========================
     LOAD FROM LOCALSTORAGE
  ========================= */

  useEffect(() => {
    const stored = localStorage.getItem("students");
    if (stored) {
      setStudents(JSON.parse(stored));
    }
  }, []);

  /* =========================
     SAVE TO LOCALSTORAGE
  ========================= */

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
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

    const percentage = (total / maxTotal) * 100;

    const newStudent: Student = {
      id: Date.now(),
      name: studentName,
      marks: formattedMarks,
      total,
      percentage,
    };

    setStudents((prev) => [...prev, newStudent]);

    // RESET
    setStudentName("");
    setMarks({});
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <h1 className="text-4xl font-extrabold text-slate-800">
          Student Result Dashboard
        </h1>

        {/* FORM */}
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-lg">
          <input
            className="w-full rounded-xl border p-4"
            placeholder="Student Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.name} className="rounded-xl border p-3">
                <p className="font-bold">{course.name}</p>
                <input
                  type="number"
                  className="mt-2 w-full rounded border p-2"
                  placeholder={`/${course.max}`}
                  value={marks[course.name] || ""}
                  onChange={(e) =>
                    handleMarkChange(course.name, e.target.value)
                  }
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleAddStudent}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white"
          >
            Add Student
          </button>
        </div>

        {/* TABLE */}
        <div className="mt-10 overflow-x-auto rounded-xl bg-white p-4">
          <table className="w-full">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3">Student</th>
                {courses.map((c) => (
                  <th key={c.name} className="p-3">
                    {c.name}
                  </th>
                ))}
                <th className="p-3">Total</th>
                <th className="p-3">%</th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={courses.length + 3} className="p-6 text-center">
                    No students yet
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b">
                    <td className="p-3 font-bold">{student.name}</td>

                    {courses.map((course) => {
                      const mark = student.marks[course.name];
                      const passed = mark >= course.pass;

                      return (
                        <td
                          key={course.name}
                          className={passed ? "text-green-600" : "text-red-600"}
                        >
                          {mark}/{course.max}
                        </td>
                      );
                    })}

                    <td className="p-3 font-bold text-indigo-600">
                      {student.total}/{maxTotal}
                    </td>

                    <td className="p-3 font-bold">
                      {student.percentage.toFixed(1)}%
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setOpenModal(true);
                        }}
                        className="rounded bg-indigo-600 px-3 py-1 text-white"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentModal
        open={openModal}
        student={selectedStudent}
        onClose={() => setOpenModal(false)}
      />
    </main>
  );
}
