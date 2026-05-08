"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { courses } from "../data/courses";
import { Student } from "../types/index";

type Props = {
  open: boolean;
  student: Student | null;
  onClose: () => void;
};

export default function StudentModal({ open, student, onClose }: Props) {
  if (!open || !student) return null;

  const maxTotal = courses.reduce((acc, c) => acc + c.max, 0);

  // GENERATE PDF
  const generatePDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text("Bulletin de l'Élève", 14, 20);

    // Student Info
    doc.setFontSize(12);
    doc.text(`Nom: ${student.name}`, 14, 35);

    // Table
    autoTable(doc, {
      startY: 45,
      head: [["Cours", "Note", "Max", "Pass", "Statut"]],
      body: courses.map((course) => {
        const mark = student.marks[course.name];
        const passed = mark >= course.pass;

        return [
          course.name,
          mark,
          course.max,
          course.pass,
          passed ? "Réussi" : "Échec",
        ];
      }),
    });

    // Summary
    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.text(`Total: ${student.total}/${maxTotal}`, 14, finalY);

    doc.text(`Pourcentage: ${student.percentage.toFixed(1)}%`, 14, finalY + 10);

    doc.text(
      `Décision: ${student.percentage >= 50 ? "Réussi" : "Échec"}`,
      14,
      finalY + 20,
    );

    // Download
    doc.save(`${student.name}-bulletin.pdf`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Bulletin de l'Élève</h2>

            <p className="text-slate-500">{student.name}</p>
          </div>

          <div className="flex gap-3">
            {/* PDF BUTTON */}
            <button
              onClick={generatePDF}
              className="rounded-full bg-indigo-600 px-4 py-2 text-white"
            >
              Télécharger PDF
            </button>

            <button
              onClick={onClose}
              className="rounded-full bg-red-100 px-4 py-2 text-red-600"
            >
              X
            </button>
          </div>
        </div>

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
                    className={`p-3 font-bold ${
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

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-100 p-4">
            <h3 className="font-bold">Total</h3>

            <p className="text-2xl text-indigo-600">
              {student.total}/{maxTotal}
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <h3 className="font-bold">Pourcentage</h3>

            <p className="text-2xl text-green-600">
              {student.percentage.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 p-4">
            <h3 className="font-bold">Décision</h3>

            <p
              className={`text-2xl font-bold ${
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
