
export default function Card({title, right, children, className = ""}){
    return(
        <div className={`rounded-xl border bg-white shadow-sm ${className}`}>
            {(title || right) && (
                <div className="flex items-center justify-between border-b px-4 py-2">
                    <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                    {right}
                </div>
            )}
            <div className="p-4">{children}</div>
        </div>
    )
}