export default function Table({ columns, data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-3 text-center text-gray-500">
                No hay registros
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-800">
                    {row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3 text-sm space-x-2">
                  <button
                    onClick={() => onEdit(row.id)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(row.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}