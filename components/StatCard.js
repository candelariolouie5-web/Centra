export default function StatCard({
  title,
  value,
  change,
  positive = false,
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
      <p className="text-sm text-gray-400">{title}</p>

      <div className="flex items-end justify-between mt-2">
        <h3 className="text-2xl font-bold">{value}</h3>

        <span
          className={`text-sm ${
            positive ? "text-green-400" : "text-red-400"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  )
}
