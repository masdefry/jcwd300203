

export const InvalidLinkError = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white border rounded-xl shadow-lg p-8 space-y-7">
            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-red-600">
                Oopsie, something went wrong
              </h1>
              <p className="text-gray-500">
                Invalid Link | 401
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };