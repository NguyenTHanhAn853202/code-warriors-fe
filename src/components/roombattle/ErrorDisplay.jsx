export default function ErrorDisplay({ error }) {
    if (!error) return null;
    
    return (
        <div className="bg-red-700 bg-opacity-30 p-4 rounded-lg border border-red-500 mt-4 text-center">
            <p className="text-red-200">
                <span className="inline-block mr-2">⚠️</span>
                {error}
            </p>
        </div>
    );
}