"use client";

import { Student } from "./data/types"; // or define type locally if needed

import { courses } from "./data/courses"; // optional if you move courses too

type Props = {
  open: boolean;
  student: Student | null;
  onClose: () => void;
};

export default function StudentModal({ open, student, onClose }: Props) {
  if (!open || !student) return null;

  const maxTotal = courses.reduce((acc, c) => acc + c.max, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mb-6 flex justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bulletin de l'Élève</h2>
            <p className="text-slate-500">{student.name}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-red-100 px-4 py-2 font-bold text-red-600"
          >
            X
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">Cours</th>
                <th className="p-3 text-left">Note</th>
                <th className="p-3 text-left">Max</th>
                <th className="p-3 text-left">Pass</th>
                <th className="p-3 text-left">Statut</th>
              </tr>
            </thead>

            <tbody>
              {courses.map((course) => {
                const mark = student.marks[course.name];
                const passed = mark >= course.pass;

                return (
                  <tr key={course.name} className="border-b">
                    <td className="p-3">{course.name}</td>
                    <td className="p-3">{mark}</td>
                    <td className="p-3">{course.max}</td>
                    <td className="p-3">{course.pass}</td>
                    <td
                      className={
                        passed ? "text-green-600 p-3" : "text-red-600 p-3"
                      }
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
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-100 p-4">
            <p className="font-bold">Total</p>
            <p className="text-xl text-indigo-600">
              {student.total}/{maxTotal}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <p className="font-bold">Pourcentage</p>
            <p className="text-xl text-emerald-600">
              {student.percentage.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <p className="font-bold">Décision</p>
            <p
              className={`text-xl font-bold ${
                student.percentage >= 50 ? "text-green-600" : "text-red-600"
              }`}
            >
              {student.percentage >= 50 ? "Réussi" : "Échec"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
