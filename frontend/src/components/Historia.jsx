import React from 'react';

const Historia = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-center text-gray-400 p-4">Zatiaľ žiadna história</p>;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="overflow-x-auto w-[70%] min-w-[400px]">
      <table className="table-fixed border-collapse text-gray-300 w-full" style={{ borderSpacing: "20px 0" }}>
        <tbody>
          {history.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-800/20'}>
              <td className="px-6 py-3 text-left">{item.text}</td>
              <td className="px-6 py-3 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.prediction.includes("toxický") 
                  ? "bg-red-500/40 text-red-100" 
                  : "bg-green-500/40 text-green-100"
                }`}>
                  {item.prediction}
                </span>
              </td>
              <td className="px-6 py-3 text-right text-gray-400 text-xs">{item.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default Historia;
