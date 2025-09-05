import { useState } from "react";

// 최소한의 스타일링을 위한 기본 컴포넌트들
const Button = ({ children, onClick, className = "", disabled = false, type = "button" }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-xl transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const Input = ({ value, onChange, placeholder, className = "", onKeyDown }: any) => (
  <input
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    placeholder={placeholder}
    className={`flex w-full bg-transparent outline-none ${className}`}
  />
);

// 아이콘들 (SVG로 간단하게)
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14"/>
    <path d="m12 5 7 7-7 7"/>
  </svg>
);

// 로고 이미지 import
const logo = "figma:asset/a68fb43a0014b2bfe230e515424245fd48949d41.png";

// 메인 로고 컴포넌트
const Logo = () => (
  <div className="flex flex-col items-center justify-center">
    <div className="w-24 h-24 flex items-center justify-center mb-8">
      <img 
        src={logo} 
        alt="Role GPT Logo" 
        className="w-full h-full object-contain filter brightness-0 invert"
      />
    </div>
    <div className="text-center">
      <h1 className="text-4xl font-light text-white tracking-tight">Role GPT</h1>
      <p className="text-sm text-gray-400 mt-2 font-light">
        AI that plays any role you need
      </p>
    </div>
  </div>
);

// 입력 컴포넌트
const ChatInput = ({ onSend, value, onChange, isCenter = false }: any) => {
  const [message, setMessage] = useState('');
  const currentValue = value !== undefined ? value : message;
  const setValue = onChange || setMessage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentValue.trim()) {
      onSend(currentValue.trim());
      setValue('');
    }
  };

  const containerClass = isCenter 
    ? "w-full max-w-2xl mx-auto px-4" 
    : "fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4";

  return (
    <div className={containerClass}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-3xl px-6 py-5 shadow-2xl">
          <Button className="w-10 h-10 bg-transparent hover:bg-gray-700/30 text-gray-400">
            <PlusIcon />
          </Button>
          
          <Input
            value={currentValue}
            onChange={(e: any) => setValue(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 text-lg text-white placeholder-gray-400"
            onKeyDown={(e: any) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <Button
            type="submit"
            disabled={!currentValue.trim()}
            className={`w-10 h-10 rounded-xl transition-all ${
              currentValue.trim() 
                ? 'bg-white text-black hover:bg-gray-200' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            <SendIcon />
          </Button>
        </div>
      </form>
      
      {isCenter && (
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Role GPT can help you with any task by adopting the perfect role
          </p>
        </div>
      )}
    </div>
  );
};

// 사이드바
const Sidebar = ({ isOpen, onClose, onRoleSelect }: any) => {
  const roles = [
    { title: "Teacher", description: "Educational guidance", emoji: "📚" },
    { title: "Developer", description: "Programming help", emoji: "💻" },
    { title: "Consultant", description: "Business advice", emoji: "💼" },
    { title: "Coach", description: "Personal development", emoji: "⭐" }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:z-auto`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src={logo} 
                alt="Role GPT" 
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <span className="text-lg font-medium text-white">Role GPT</span>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-800 text-gray-300">
            💬 New Chat
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-gray-800 text-gray-300">
            📝 History
          </button>
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <div className="text-sm font-medium text-white mb-3">Quick Roles</div>
          {roles.map((role, index) => (
            <button
              key={index}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-800 text-gray-300 mb-2"
              onClick={() => {
                onRoleSelect(`Act as a ${role.title}. ${role.description}`);
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <span>{role.emoji}</span>
                <div>
                  <div className="font-medium">{role.title}</div>
                  <div className="text-xs text-gray-500">{role.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// 채팅 영역
const ChatArea = ({ messages }: any) => {
  if (messages.length > 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg: any, index: number) => (
            <div key={index} className="flex gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                {msg.sender === 'user' ? (
                  <div className="w-6 h-6 bg-white rounded-md"></div>
                ) : (
                  <img 
                    src={logo} 
                    alt="Role GPT" 
                    className="w-4 h-4 object-contain filter brightness-0 invert"
                  />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">
                  {msg.sender === 'user' ? 'You' : 'Role GPT'}
                </div>
                <div className="text-white">{msg.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <Logo />
    </div>
  );
};

// 메인 앱
export default function MinimalApp() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSend = (message: string) => {
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    
    // 시뮬레이션 응답
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "I understand your request. I'm ready to help you in whatever role you need!", 
        sender: 'assistant' 
      }]);
    }, 1000);
  };

  const handleRoleSelect = (rolePrompt: string) => {
    setInputValue(rolePrompt);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#ffffff', height: '100vh', width: '100vw', overflow: 'hidden', display: 'flex' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isOpen={true} onClose={() => {}} onRoleSelect={handleRoleSelect} />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onRoleSelect={handleRoleSelect} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Mobile Header */}
        <div className="flex items-center p-4 border-b border-gray-800 lg:hidden">
          <Button 
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 bg-transparent hover:bg-gray-800 text-gray-400"
          >
            <MenuIcon />
          </Button>
        </div>

        {/* Chat Content */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col">
            <ChatArea messages={messages} />
            <div className="pb-20">
              <ChatInput
                onSend={handleSend}
                value={inputValue}
                onChange={setInputValue}
                isCenter={true}
              />
            </div>
          </div>
        ) : (
          <>
            <ChatArea messages={messages} />
            <ChatInput
              onSend={handleSend}
              value={inputValue}
              onChange={setInputValue}
              isCenter={false}
            />
          </>
        )}
      </div>
    </div>
  );
}