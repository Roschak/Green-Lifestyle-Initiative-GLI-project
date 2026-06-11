import { useEffect, useState } from "react";
import { loadScoringData } from "./scoringData";

export default function ScoringGuide() {
  const [scoringData, setScoringData] = useState([]);

  useEffect(() => {
    loadScoringData().then((data) => {
      setScoringData(data);
    });
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 h-full max-h-[650px] overflow-y-auto">

      <h2 className="text-lg font-bold text-green-700 mb-4">
        📊 Panduan Penilaian
      </h2>

      <div className="space-y-3">

        {scoringData.map((item, index) => (
          <div
            key={index}
            className="bg-green-50 border border-green-100 rounded-xl p-3"
          >

            <div className="flex justify-between items-center mb-2">

              <h3 className="font-semibold text-sm text-gray-800">
                {item["Kategori Aksi"]}
              </h3>

              <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                {item["Rentang Poin"]}
              </span>

            </div>

            <p className="text-xs text-gray-600 mb-2">
              <strong>Contoh:</strong>{" "}
              {item["Contoh Kegiatan Mandiri"]}
            </p>

            <p className="text-xs text-gray-500">
              <strong>Landasan:</strong>{" "}
              {item["Landasan Penilaian Admin"]}
            </p>

          </div>
        ))}

      </div>
    </div>
  );
}
