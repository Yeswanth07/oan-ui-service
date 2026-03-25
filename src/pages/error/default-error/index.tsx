import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface DefaultErrorProps {
  error?: unknown;
  reset?: () => void;
}

export default function DefaultError({ error }: DefaultErrorProps) {
  const message =
    typeof error === "string"
      ? error
      : (error && (error as any).message) || "An unexpected error occurred.";

  return (
    <div 
      style={{ backgroundColor: '#212C28' }} 
      className="flex min-h-screen w-full items-center justify-center p-4"
    >
      <div 
        style={{
          padding: '1px',
          background: '#019444',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <div 
          style={{
            background: '#212C28',
            borderRadius: '23px',
            overflow: 'hidden',
            position: 'relative'
          }}
          className="w-full"
        >
          <div 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            className="w-full p-8 text-center flex flex-col items-center space-y-6"
          >
            <div className="rounded-full bg-red-500/20 p-4">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            
            <div className="space-y-2 w-full">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Something went wrong
              </h1>
              <p className="text-gray-400 text-sm break-words px-4 leading-tight">
                {message}
              </p>
            </div>

            <div className="flex flex-col w-full gap-3 pt-2">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-white hover:bg-gray-200 text-[#212C28] font-bold h-10 rounded-xl flex items-center justify-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
              
              <a href="/" className="w-full no-underline">
                <button 
                  className="w-full border border-white/20 text-white hover:bg-white/10 h-10 rounded-xl flex items-center justify-center bg-transparent"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
