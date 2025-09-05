/**
 * Role GPT - 메인 애플리케이션 컴포넌트
 * 
 * ChatGPT 스타일의 AI 채팅 인터페이스
 * - Role 기반 AI 어시스턴트와의 대화
 * - 프로젝트 기반 채팅 관리
 * - 반응형 모바일/데스크톱 지원
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { devLog, devWarn, safeApiCall, isDevelopment } from './src/utils/devUtils';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatMain } from './components/ChatMain';
import { GrokStyleInput } from './components/GrokStyleInput';
import { ProjectGalleryPage } from './components/ProjectGalleryPage';
import { SimpleChatDrawer } from './components/SimpleChatDrawer';
import { ChatHistoryPage } from './components/ChatHistoryPage';
import { AppModals } from './components/AppModals';
import { MobileLayout } from './components/layouts/MobileLayout';
import { DesktopLayout } from './components/layouts/DesktopLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useIsMobile } from './components/ui/use-mobile';
import { useApp, AppProvider } from './src/context/AppContext';
import { useAppHandlers } from './src/hooks/useAppHandlers';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { Project } from './src/types';
import { toast } from "sonner";

/**
 * 메인 애플리케이션 컨텐츠 컴포넌트
 * 
 * 전체 앱의 상태와 레이아웃을 관리하는 핵심 컴포넌트
 * - 모바일/데스크톱 반응형 레이아웃
 * - 모달 시스템 관리
 * - 사이드바 상태 제어
 * - 채팅 및 프로젝트 상태 관리
 */
function AppContent() {
  const isMobile = useIsMobile();
  const { state, setSidebarExpanded, setError, setActiveChat, setSelectedRole, addConversation, updateConversation, updateProject, deleteProject, addProject } = useApp();
  
  // Custom hooks
  const {
    handleSendMessage,
    handleRoleSelect,
    handleNewChat,
    handleChatSelect,
    handleNewProject,
    handleProjectSelectionModalSelect,
    handleProjectSelectionModalNewProject,
    getChatActionHandlers,
    deleteConversation
  } = useAppHandlers();
  
  useAppInitialization();

  /**
   * 개발용 목업 채팅 생성 함수
   * 
   * Role GPT의 기능을 시연하기 위한 데모 채팅을 생성
   * - AI 메시지 액션 버튼 테스트
   * - UI/UX 검증용
   * - 실제 API 호출 없이 기능 확인
   * 
   * TODO: 프로덕션에서는 제거하거나 개발 모드에서만 활성화
   */
  const generateMockChat = () => {
    const mockChatId = 'mock_chat_demo';
    // Buddy Role을 먼저 찾고, 없으면 guide Role, 마지막으로 첫 번째 Role
    const buddyRole = state.roles.find(r => r.id === 'buddy') || 
                      state.roles.find(r => r.id === 'guide') || 
                      state.roles[0];
    
    const mockMessages = [
      {
        id: 1,
        text: "안녕하세요! Role GPT의 새로운 UI에 대해 질문이 있어요.",
        sender: 'user' as const,
        timestamp: new Date(Date.now() - 5 * 60 * 1000) // 5분 전
      },
      {
        id: 2,
        text: "안녕하세요! Role GPT의 새로운 인터페이스에 대해 궁금한 점이 있으시군요. 무엇을 도와드릴까요?\n\n새로운 UI는 다음과 같은 특징들이 있습니다:\n\n1. **ChatGPT 스타일 인터페이스**: 친숙하고 직관적인 디자인\n2. **반응형 사이드바**: 대화 내역과 Role 관리가 편리\n3. **스마트한 입력창**: 음성 인식, 설정 등 통합 기능\n4. **Role 템플릿 갤러리**: 다양한 전문 역할 선택 가능\n\n구체적으로 어떤 부분에 대해 더 자세히 알고 싶으신가요?",
        sender: 'ai' as const,
        timestamp: new Date(Date.now() - 4 * 60 * 1000) // 4분 전
      },
      {
        id: 3,
        text: "AI 메시지에 대한 액션 기능들은 어떤 것들이 있나요? 예를 들어 메시지를 다시 생성하거나 복사하는 기능 말이에요.",
        sender: 'user' as const,
        timestamp: new Date(Date.now() - 3 * 60 * 1000) // 3분 전
      },
      {
        id: 4,
        text: "좋은 질문이네요! AI 메시지에는 다양한 유용한 액션 기능들이 제공됩니다:\n\n## 🔄 메시지 액션 기능들\n\n### 1. **재생성 (Regenerate)**\n- 같은 질문에 대해 새로운 답변 생성\n- 더 나은 응답을 원할 때 유용\n- 키보드 단축키: `Ctrl + R`\n\n### 2. **복사 (Copy)**\n- 메시지 텍스트를 클립보드에 복사\n- 다른 곳에 붙여넣기 가능\n- 원클릭으로 간편하게 복사\n\n### 3. **음성 재생 (Text-to-Speech)**\n- AI 응답을 음성으로 들을 수 있음\n- 멀티태스킹 시 유용\n- 다양한 음성 옵션 제공\n\n### 4. **저장 및 내보내기**\n- 중요한 답변을 북마크로 저장\n- JSON, Markdown 등 다양한 형식으로 내보내기\n- 프로젝트별 정리 가능\n\n이러한 기능들은 메시지에 마우스를 올리면(hover) 나타나는 액션 버튼들로 쉽게 접근할 수 있습니다. 😊",
        sender: 'ai' as const,
        timestamp: new Date(Date.now() - 1 * 60 * 1000) // 1분 전
      }
    ];

    const mockChat = {
      id: mockChatId,
      title: "Role GPT UI 기능 문의",
      roleId: buddyRole.id,
      messages: mockMessages,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      lastMessageAt: new Date(Date.now() - 1 * 60 * 1000),
      isPinned: false
    };

    // 기존 목업 채팅이 있으면 제거하고 새로 추가
    console.log('🎯 목업 채팅 생성 중...', {
      mockChatId,
      buddyRole: buddyRole?.name,
      buddyRoleId: buddyRole?.id,
      existingRoles: state.roles.map(r => r.id)
    });
    
    const existingConversations = state.conversations.filter(c => c.id !== mockChatId);
    addConversation(mockChat);
    setActiveChat(mockChatId);
    setSelectedRole(buddyRole.id);
    
    console.log('✅ 목업 채팅 생성 완료', {
      conversationCount: state.conversations.length,
      activeChatId: mockChatId,
      selectedRoleId: buddyRole.id
    });
    
    toast.success('목업 채팅이 생성되었습니다! AI 메시지에 마우스를 올려 액션 버튼들을 확인해보세요.');
  };

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [roleGptOpen, setRoleGptOpen] = useState(false);
  const [roleLibraryOpen, setRoleLibraryOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryButtonPosition, setCategoryButtonPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [projectViewOpen, setProjectViewOpen] = useState(false);
  const [projectGalleryOpen, setProjectGalleryOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDeleteModalOpen, setProjectDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState<{ type: 'chat' | 'project'; id: string } | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatHistoryPageOpen, setChatHistoryPageOpen] = useState(false);

  // Derived state
  const currentChat = state.conversations.find(c => c.id === state.activeChatId);
  const selectedRole = state.selectedRoleId ? state.roles.find(r => r.id === state.selectedRoleId) : null;
  const messages = currentChat?.messages || [];
  const chatActions = getChatActionHandlers();

  // Effect for mutual exclusive modals
  useEffect(() => {
    if (roleGptOpen || roleLibraryOpen) {
      setNewProjectOpen(false);
      setProjectViewOpen(false);
      setSelectedProjectId(null);
    }
  }, [roleGptOpen, roleLibraryOpen]);

  useEffect(() => {
    if (!state.activeChatId && !selectedRole) {
      setNewProjectOpen(false);
      setProjectViewOpen(false);
      setSelectedProjectId(null);
      setRoleGptOpen(false);
      setRoleLibraryOpen(false);
      setCategoryModalOpen(false);
    }
  }, [state.activeChatId, selectedRole]);

  // Handlers
  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };

  const handleRoleSelectWithCleanup = async (roleData: any) => {
    await handleRoleSelect(roleData);
    setInputValue('');
    setCategoryModalOpen(false);
    setRoleGptOpen(false);
    setRoleLibraryOpen(false);
    setSelectedCategory('');
    setNewProjectOpen(false);
    setProjectViewOpen(false);
    setSelectedProjectId(null);
  };

  const handleNewProjectWithState = () => {
    const result = handleNewProject();
    if (result.newProject && result.openProjectPage) {
      setSelectedProjectId(result.newProject.id);
      setProjectViewOpen(true);
    } else if (result.openNewProjectPage) {
      setNewProjectOpen(true);
    }
  };

  const handleProjectViewAll = () => {
    setProjectGalleryOpen(true);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setProjectViewOpen(true);
    setSidebarExpanded(false);
  };

  const handleProjectDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      toast.success(`프로젝트 "${projectToDelete.title}"가 삭제되었습니다.`);
      setProjectToDelete(null);
    }
    setProjectDeleteModalOpen(false);
  };

  const handleProjectDeleteCancel = () => {
    setProjectDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const handleChatIconChange = (chatId: string) => {
    setIconPickerTarget({ type: 'chat', id: chatId });
    setIconPickerOpen(true);
  };

  const handleProjectIconChange = (projectId: string) => {
    setIconPickerTarget({ type: 'project', id: projectId });
    setIconPickerOpen(true);
  };

  const handleIconSelect = (iconName: string) => {
    if (iconPickerTarget) {
      if (iconPickerTarget.type === 'chat') {
        updateConversation(iconPickerTarget.id, { icon: iconName });
        toast.success('채팅 아이콘이 변경되었습니다.');
      } else if (iconPickerTarget.type === 'project') {
        updateProject(iconPickerTarget.id, { icon: iconName });
        toast.success('프로젝트 아이콘이 변경되었습니다.');
      }
    }
    setIconPickerOpen(false);
    setIconPickerTarget(null);
  };

  const handleDropChatToProject = (chatId: string, projectId: string) => {
    updateConversation(chatId, { projectId: projectId });
    
    const project = state.projects.find(p => p.id === projectId);
    if (project) {
      const projectChatCount = state.conversations.filter(c => c.projectId === projectId).length;
      updateProject(projectId, { chatCount: projectChatCount + 1 });
    }
  };

  const handleChatRemoveFromProject = (chatId: string) => {
    const chat = state.conversations.find(c => c.id === chatId);
    if (chat && chat.projectId) {
      updateConversation(chatId, { projectId: undefined });
      
      const projectChatCount = state.conversations.filter(c => c.projectId === chat.projectId).length;
      updateProject(chat.projectId, { chatCount: Math.max(0, projectChatCount - 1) });
      
      toast.success('채팅이 프로젝트에서 제거되었습니다.');
    }
  };

  // AI 메시지 액션 핸들러들
  const handleRegenerateMessage = (messageId: number) => {
    toast.info('메시지를 다시 생성합니다...');
    // TODO: 실제 재생성 로직 구현
    console.log('Regenerating message:', messageId);
  };

  const handleSaveMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      // TODO: 북마크 시스템에 저장하는 로직 구현
      toast.success('메시지가 북마크에 저장되었습니다.');
      console.log('Saving message to bookmarks:', message);
    }
  };

  const handleExportMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      const messageData = {
        id: message.id,
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp,
        chat: currentChat?.title || 'Untitled Chat',
        role: selectedRole?.name || 'Assistant'
      };
      
      const dataStr = JSON.stringify(messageData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `message_${messageId}_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('메시지가 내보내기 되었습니다.');
    }
  };

  // 사용자 메시��� 편집 핸들러
  const handleEditMessage = (messageId: number, newText: string) => {
    if (currentChat) {
      const updatedMessages = currentChat.messages.map(msg => 
        msg.id === messageId ? { ...msg, text: newText } : msg
      );
      updateConversation(currentChat.id, { messages: updatedMessages });
    }
  };

  // 사용자 메시지 삭제 핸들러
  const handleDeleteMessage = (messageId: number) => {
    if (currentChat) {
      const updatedMessages = currentChat.messages.filter(msg => msg.id !== messageId);
      updateConversation(currentChat.id, { messages: updatedMessages });
    }
  };

  if (projectGalleryOpen) {
    return (
      <ProjectGalleryPage
        isOpen={projectGalleryOpen}
        onClose={() => setProjectGalleryOpen(false)}
        onNewProject={handleNewProjectWithState}
        sidebarExpanded={state.sidebarExpanded}
        projects={state.projects}
        onProjectSelect={handleProjectSelect}
        onProjectRename={(projectId, newTitle) => {
          updateProject(projectId, { title: newTitle });
        }}
        onProjectDelete={(projectId) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            setProjectToDelete({ id: projectId, title: project.title });
            setProjectDeleteModalOpen(true);
          }
        }}
      />
    );
  }

  if (chatHistoryPageOpen) {
    return (
      <ChatHistoryPage
        isOpen={chatHistoryPageOpen}
        onClose={() => setChatHistoryPageOpen(false)}
        chatHistory={state.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          role: state.roles.find(r => r.id === conv.roleId) || null,
          messages: conv.messages,
          createdAt: conv.createdAt,
          lastMessageAt: conv.lastMessageAt,
          isPinned: conv.isPinned
        }))}
        onChatSelect={(chatId) => {
          handleChatSelect(chatId);
          setChatHistoryPageOpen(false);
        }}
        onChatDelete={deleteConversation}
        onChatExport={(chatId) => {
          const chat = state.conversations.find(c => c.id === chatId);
          if (chat) {
            const role = state.roles.find(r => r.id === chat.roleId);
            const chatData = {
              title: chat.title,
              role: role?.name || '기본 어시스턴트',
              messages: chat.messages,
              createdAt: chat.createdAt
            };
            
            const dataStr = JSON.stringify(chatData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            
            toast.success('채팅이 내보내기 되었습니다.');
          }
        }}
        onChatAddToProject={() => {
          // TODO: 프로젝트 선택 모달을 여는 로직 구현
          toast.info('프로젝트 선택 기능을 곧 지원할 예정입니다.');
        }}
        currentChatId={state.activeChatId}
        roles={state.roles}
      />
    );
  }

  return (
    <div className={`w-screen bg-background overflow-hidden relative ${isMobile ? 'mobile-screen' : 'h-screen'}`}>
      {/* Chat Sidebar */}
      <ChatSidebar
        isExpanded={state.sidebarExpanded}
        onToggle={() => setSidebarExpanded(!state.sidebarExpanded)}
        onSettingsClick={() => setSettingsOpen(true)}
        onAccountClick={() => setSettingsOpen(true)}
        onRoleGptClick={() => setRoleGptOpen(true)}
        onRoleLibraryClick={() => setRoleLibraryOpen(true)}
        onNewChat={handleNewChat}
        onCreateMockChat={generateMockChat}
        onNewProject={handleNewProjectWithState}
        onChatSelect={handleChatSelect}
        onSearchClick={() => setSidebarExpanded(true)}
        onChatRename={(chatId, newTitle) => updateConversation(chatId, { title: newTitle })}
        onChatPin={(chatId) => {
          const chat = state.conversations.find(c => c.id === chatId);
          updateConversation(chatId, { isPinned: !chat?.isPinned });
        }}
        onChatDelete={deleteConversation}
        onChatExport={(chatId) => {
          const chat = state.conversations.find(c => c.id === chatId);
          if (chat) {
            const role = state.roles.find(r => r.id === chat.roleId);
            const chatData = {
              title: chat.title,
              role: role?.name || '기본 어시스턴트',
              messages: chat.messages,
              createdAt: chat.createdAt
            };
            
            const dataStr = JSON.stringify(chatData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
            link.click();
            URL.revokeObjectURL(url);
            
            toast.success('채팅이 내보내기 되었습니다.');
          }
        }}
        onChatAddToProject={() => {}}
        onChatIconChange={handleChatIconChange}
        onChatHistoryViewAll={() => setChatHistoryPageOpen(true)}
        onProjectSelect={handleProjectSelect}
        onProjectRename={(projectId, newTitle) => updateProject(projectId, { title: newTitle })}
        onProjectViewAll={handleProjectViewAll}
        onProjectDelete={(projectId) => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
            setProjectToDelete({ id: projectId, title: project.title });
            setProjectDeleteModalOpen(true);
          }
        }}
        onProjectDuplicate={(projectId) => {
          const originalProject = state.projects.find(p => p.id === projectId);
          if (originalProject) {
            const duplicatedProject: Project = {
              ...originalProject,
              id: `project_${Date.now()}`,
              title: `${originalProject.title} (복사본)`,
              createdAt: new Date(),
              lastModified: new Date(),
              chatCount: 0
            };
            addProject(duplicatedProject);
            toast.success(`프로젝트가 복제되었습니다: ${duplicatedProject.title}`);
          }
        }}
        onProjectIconChange={handleProjectIconChange}
        onRoleSelect={handleRoleSelectWithCleanup}
        chatHistory={state.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          role: state.roles.find(r => r.id === conv.roleId) || null,
          messages: conv.messages,
          createdAt: conv.createdAt,
          lastMessageAt: conv.lastMessageAt,
          isPinned: conv.isPinned
        }))}
        projects={state.projects}
        currentChatId={state.activeChatId}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className={`w-full h-full flex flex-col transition-all duration-300 ${
        isMobile 
          ? state.sidebarExpanded 
            ? 'opacity-50 pointer-events-none' 
            : (newProjectOpen || projectViewOpen) ? 'opacity-50 pointer-events-none' : ''
          : state.sidebarExpanded 
            ? (newProjectOpen || projectViewOpen) ? 'pl-[544px]' : 'pl-76'
            : (newProjectOpen || projectViewOpen) ? 'pl-[336px]' : 'pl-16'
      }`}>
        {messages.length === 0 ? (
          // Empty chat state
          isMobile ? (
            <MobileLayout
              messages={messages}
              selectedRole={selectedRole}
              onExampleClick={handleExampleClick}
              onSendMessage={handleSendMessage}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onRoleSelect={handleRoleSelectWithCleanup}
              onCategorySelect={(category, buttonPosition) => {
                setSelectedCategory(category);
                setCategoryButtonPosition(buttonPosition);
                setCategoryModalOpen(true);
              }}
              chatActions={chatActions}
              userSettings={state.userSettings}
              activeChatId={state.activeChatId || ''}
              projects={state.projects}
              onProjectSelect={handleProjectSelectionModalSelect}
              onNewProject={handleProjectSelectionModalNewProject}
              currentChat={currentChat}
              onAccountModalOpen={() => setSettingsOpen(true)}
            />
          ) : (
            <DesktopLayout
              messages={messages}
              selectedRole={selectedRole}
              onExampleClick={handleExampleClick}
              onSendMessage={handleSendMessage}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onRoleSelect={handleRoleSelectWithCleanup}
              onCategorySelect={(category, buttonPosition) => {
                setSelectedCategory(category);
                setCategoryButtonPosition(buttonPosition);
                setCategoryModalOpen(true);
              }}
              chatActions={chatActions}
              userSettings={state.userSettings}
              activeChatId={state.activeChatId || ''}
              projects={state.projects}
              onProjectSelect={handleProjectSelectionModalSelect}
              onNewProject={handleProjectSelectionModalNewProject}
              currentChat={currentChat}
              onAccountModalOpen={() => setSettingsOpen(true)}
            />
          )
        ) : (
          // Chat in progress state
          <div className="flex flex-col h-full relative">
            <div className="flex-1 overflow-hidden">
              <ChatMain
                messages={messages}
                onExampleClick={handleExampleClick}
                isMobile={isMobile}
                selectedRole={selectedRole}
                onExport={chatActions.handleChatExport}
                onSave={chatActions.handleChatSave}
                onAddToProject={() => {}}
                onDelete={chatActions.handleChatDelete}
                onArchive={chatActions.handleChatArchive}
                onShare={chatActions.handleChatShare}
                onOpenChatDrawer={() => setChatDrawerOpen(true)}
                currentMode={state.userSettings.mode}
                chatId={state.activeChatId || ''}
                projects={state.projects}
                onProjectSelect={handleProjectSelectionModalSelect}
                onNewProject={handleProjectSelectionModalNewProject}
                chatTitle={currentChat?.title}
                onRegenerateMessage={handleRegenerateMessage}
                onSaveMessage={handleSaveMessage}
                onExportMessage={handleExportMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 z-10">
              <GrokStyleInput
                onSendMessage={handleSendMessage}
                value={inputValue}
                onChange={setInputValue}
                isInCenter={false}
                selectedRole={selectedRole}
                onAccountModalOpen={() => setSettingsOpen(true)}
              />
            </div>

            <SimpleChatDrawer
              isOpen={chatDrawerOpen}
              onToggle={() => setChatDrawerOpen(!chatDrawerOpen)}
              currentMode={state.userSettings.mode}
              messages={messages}
              chatId={state.activeChatId || ''}
              onSettingsChange={() => {}}
              isMobile={isMobile}
            />
          </div>
        )}
      </div>

      {/* Sidebar Toggle Buttons */}
      {!isMobile ? (
        <button
          onClick={() => setSidebarExpanded(!state.sidebarExpanded)}
          className={`fixed top-1/2 transform -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-background border border-border shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:bg-accent group ${
            state.sidebarExpanded ? 'left-[280px]' : 'left-[40px]'
          }`}
        >
          <div className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors transform ${
            state.sidebarExpanded ? 'rotate-180' : 'rotate-0'
          } transition-transform duration-300`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      ) : (
        !state.sidebarExpanded && (
          <button
            onClick={() => setSidebarExpanded(true)}
            className="fixed left-4 z-50 w-10 h-10 rounded-lg bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-all"
            style={{
              top: 'max(60px, calc(env(safe-area-inset-top, 12px) + 48px))'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )
      )}

      {/* Loading & Error Indicators */}
      {state.isLoading && (
        <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-muted/80 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
              <span className="text-sm text-foreground/80">응답 생성 중...</span>
            </div>
          </div>
        </div>
      )}

      {state.error && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg max-w-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm">{state.error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-destructive-foreground/80 hover:text-destructive-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}



      {/* All Modals */}
      <AppModals
        roleGptOpen={roleGptOpen}
        setRoleGptOpen={setRoleGptOpen}
        roleLibraryOpen={roleLibraryOpen}
        setRoleLibraryOpen={setRoleLibraryOpen}
        categoryModalOpen={categoryModalOpen}
        setCategoryModalOpen={setCategoryModalOpen}
        selectedCategory={selectedCategory}
        categoryButtonPosition={categoryButtonPosition}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}

        newProjectOpen={newProjectOpen}
        setNewProjectOpen={setNewProjectOpen}
        projectViewOpen={projectViewOpen}
        setProjectViewOpen={setProjectViewOpen}
        projectGalleryOpen={projectGalleryOpen}
        setProjectGalleryOpen={setProjectGalleryOpen}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        projectDeleteModalOpen={projectDeleteModalOpen}
        setProjectDeleteModalOpen={setProjectDeleteModalOpen}
        projectToDelete={projectToDelete}
        setProjectToDelete={setProjectToDelete}
        iconPickerOpen={iconPickerOpen}
        setIconPickerOpen={setIconPickerOpen}
        iconPickerTarget={iconPickerTarget}
        setIconPickerTarget={setIconPickerTarget}
        onRoleSelect={handleRoleSelectWithCleanup}
        onChatSelect={handleChatSelect}
        onProjectSelect={handleProjectSelect}
        onProjectViewAll={handleProjectViewAll}
        onProjectDeleteConfirm={handleProjectDeleteConfirm}
        onProjectDeleteCancel={handleProjectDeleteCancel}
        onIconSelect={handleIconSelect}
        onUpdateProject={updateProject}
        onAddProject={addProject}
        onDeleteProject={deleteProject}
        onChatRemoveFromProject={handleChatRemoveFromProject}
        onDropChatToProject={handleDropChatToProject}
        state={state}
        sidebarExpanded={state.sidebarExpanded}
      />


    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}