const lockImg = "/assets/lockImg.svg";

export default function AuthError() {
  return (
    <div 
      style={{ backgroundColor: '#212C28' }} 
      className="flex min-h-screen w-full items-center justify-center p-4"
    >
      {/* 24px rounded gradient border wrapper */}
      <div 
        style={{
          padding: '1px',
          background: '#019444',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '350px'
        }}
      >
        {/* Card content with inner background and radius */}
        <div 
          style={{
            background: '#212C28',
            borderRadius: '23px',
            overflow: 'hidden',
            position: 'relative'
          }}
          className="w-full"
        >
          {/* #FFFFFF1A Overlay */}
          <div 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            className="w-full p-10 flex flex-col items-center text-center space-y-6"
          >
            <img src={lockImg} alt="Locked" className="h-16 w-16" />
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Login required
              </h1>
              <p className="text-gray-300 font-normal text-sm leading-relaxed px-2">
                Please log in to continue and access this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
