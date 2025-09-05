import { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { defaultRole } from '../constants/defaultRoles';
import { streamTrialMessage } from '../providers/gemini';
import { Message, Role, Conversation, Project, Mode } from '../types';
import { useCrossModeGuard } from './useCrossModeGuard';
import { toast } from "sonner";

export function useAppHandlers() {
  const { 
    state, 
    setActiveChat, 
    setSelectedRole, 
    setSidebarExpanded, 
    setLoading, 
    setError, 
    setGenerationStopped,
    addConversation, 
    updateConversation, 
    deleteConversation, 
    addProject, 
    updateProject, 
    deleteProject, 
    addRole 
  } = useApp();

  const messageIdCounter = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cross-Mode Guard 훅
  const crossModeGuard = useCrossModeGuard({
    onSwitchChatMode: (chatId: string, newMode: Mode) => {
      toast.success(`채팅 모드를 ${newMode}으로 변경했습니다.`);
    },
    onCloneRole: async (roleId: string, targetMode: Mode) => {
      const originalRole = state.roles.find(r => r.id === roleId);
      if (originalRole) {
        const clonedRole: Role = {
          ...originalRole,
          id: `custom_${Date.now()}`,
          name: `${originalRole.name} (${targetMode.toUpperCase()})`,
          category: 'custom',
          isCustom: true,
          isPinned: false
        };
        
        addRole(clonedRole);
        return clonedRole.id;
      }
      throw new Error('Role not found');
    }
  });

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || state.isLoading) return;

    setLoading(true);
    setGenerationStopped(false);
    
    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();
    
    const messageId = ++messageIdCounter.current;
    const selectedRole = state.selectedRoleId ? state.roles.find(r => r.id === state.selectedRoleId) : null;
    
    const userMessage: Message = {
      id: messageId,
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    if (!state.activeChatId) {
      const newChatId = `chat_${Date.now()}`;
      
      const newConversation: Conversation = {
        id: newChatId,
        title: message.length > 50 ? message.substring(0, 50) + '...' : message,
        roleId: selectedRole?.id || defaultRole.id,
        messages: [userMessage],
        createdAt: new Date(),
        lastMessageAt: new Date()
      };
      
      addConversation(newConversation);
      setActiveChat(newChatId);
      
      if (!selectedRole) {
        setSelectedRole(defaultRole.id);
      }
    } else {
      const currentChat = state.conversations.find(c => c.id === state.activeChatId);
      if (currentChat) {
        updateConversation(state.activeChatId, {
          messages: [...currentChat.messages, userMessage],
          lastMessageAt: new Date()
        });
      }
    }

    try {
      const aiMessageId = ++messageIdCounter.current;
      const aiMessage: Message = {
        id: aiMessageId,
        text: '',
        sender: 'ai',
        timestamp: new Date()
      };

      const activeChat = state.conversations.find(c => c.id === state.activeChatId);
      if (activeChat) {
        updateConversation(state.activeChatId!, {
          messages: [...activeChat.messages, aiMessage]
        });
      }

      let aiResponse = '';
      const roleToUse = selectedRole || defaultRole;
      
      try {
        for await (const chunk of streamTrialMessage(
          roleToUse,
          [...(activeChat?.messages || []), userMessage],
          [{ text: message }],
          abortControllerRef.current?.signal
        )) {
          // 중지 신호 확인
          if (state.isGenerationStopped || abortControllerRef.current?.signal.aborted) {
            console.log('🛑 Generation stopped by user');
            aiResponse += aiResponse ? '\n\n[중지됨]' : '[중지됨]';
            break;
          }
          
          aiResponse += chunk;
          
          const currentActiveChat = state.conversations.find(c => c.id === state.activeChatId);
          if (currentActiveChat) {
            const updatedMessages = currentActiveChat.messages.map(msg => 
              msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
            );
            updateConversation(state.activeChatId!, {
              messages: updatedMessages,
              lastMessageAt: new Date()
            });
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('🛑 Request aborted by user');
          aiResponse += aiResponse ? '\n\n[중지됨]' : '[중지됨]';
          
          const currentActiveChat = state.conversations.find(c => c.id === state.activeChatId);
          if (currentActiveChat) {
            const updatedMessages = currentActiveChat.messages.map(msg => 
              msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
            );
            updateConversation(state.activeChatId!, {
              messages: updatedMessages,
              lastMessageAt: new Date()
            });
          }
        } else {
          throw error; // 다른 에러는 다시 던지기
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: ++messageIdCounter.current,
        text: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.',
        sender: 'ai',
        timestamp: new Date()
      };

      const activeChat = state.conversations.find(c => c.id === state.activeChatId);
      if (activeChat) {
        updateConversation(state.activeChatId!, {
          messages: [...activeChat.messages, errorMessage]
        });
      }
      
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setGenerationStopped(false);
      abortControllerRef.current = null;
    }
  };

  const handleRoleSelect = async (roleData: any) => {
    try {
      if (roleData && typeof roleData === 'object' && roleData.id) {
        // Role이 실제로 존재하는지 확인
        const role = state.roles.find(r => r.id === roleData.id);
        if (!role) {
          console.warn(`Role with id ${roleData.id} not found`);
          return;
        }

        const decision = await crossModeGuard.openGuard({
          chatMode: state.userSettings.mode,
          roleMode: state.userSettings.mode,
          roleId: roleData.id,
          roleName: role.name,
          lang: 'ko'
        });

        if (decision) {
          setSelectedRole(roleData.id);
          setActiveChat(null);
        }
      }
    } catch (error) {
      // Role 선택 오류 무시
    }
  };

  const handleNewChat = () => {
    setActiveChat(null);
    if (state.userSettings.mode === 'standard') {
      setSelectedRole('guide');
    } else {
      setSelectedRole(null);
    }
    setSidebarExpanded(false);
  };

  const handleChatSelect = (chatId: string) => {
    const chat = state.conversations.find(c => c.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setSelectedRole(chat.roleId);
      setSidebarExpanded(false);
    }
  };

  const handleNewProject = () => {
    try {
      // 항상 새 프로젝트를 생성하도록 변경
      const newProject: Project = {
        id: `project_${Date.now()}`,
        title: `새 프로젝트 ${state.projects.length + 1}`,
        description: 'AI 어시스턴트와의 정보를 정리하는 프로젝트입니다.',
        category: 'general',
        guidelines: '',
        createdAt: new Date(),
        lastModified: new Date(),
        chatCount: 0,
        isPinned: false
      };
      
      addProject(newProject);
      
      const projectNumber = state.projects.length + 1;
      const isFirst = projectNumber === 1;
      
      toast.success(`${isFirst ? '첫 번째' : ''} 프로젝트 "${newProject.title}"가 생성되었습니다!`);
      return { newProject, openProjectPage: true };
    } catch (error) {
      console.error('프로젝트 생성 오류:', error);
      toast.error('프로젝트 생성 중 오류가 발생했습니다.');
      return {};
    }
  };

  const handleProjectSelectionModalSelect = (projectId: string) => {
    const targetChatId = state.activeChatId;
    if (!targetChatId) {
      toast.error('선택된 채팅이 없습니다.');
      return;
    }

    const project = state.projects.find(p => p.id === projectId);
    if (!project) {
      toast.error('프로젝트를 찾을 수 없습니다.');
      return;
    }

    updateConversation(targetChatId, { projectId: projectId });
    const currentChatCount = state.conversations.filter(c => c.projectId === projectId).length;
    updateProject(projectId, { chatCount: currentChatCount + 1 });
    
    toast.success(`채팅이 "${project.title}" 프로젝트에 추가되었습니다.`);
  };

  const handleProjectSelectionModalNewProject = () => {
    const newProject: Project = {
      id: `project_${Date.now()}`,
      title: '새 프로젝트',
      description: '',
      category: 'general',
      guidelines: '',
      createdAt: new Date(),
      lastModified: new Date(),
      chatCount: 0,
      isPinned: false
    };
    
    addProject(newProject);
    
    const targetChatId = state.activeChatId;
    if (targetChatId) {
      updateConversation(targetChatId, { projectId: newProject.id });
      updateProject(newProject.id, { chatCount: 1 });
      toast.success(`채팅이 "${newProject.title}" 프로젝트에 추가되었습니다.`);
    }
  };

  // 채팅 액션 핸들러들
  const getChatActionHandlers = () => {
    const currentChat = state.conversations.find(c => c.id === state.activeChatId);
    const selectedRole = state.selectedRoleId ? state.roles.find(r => r.id === state.selectedRoleId) : null;

    return {
      handleChatExport: () => {
        if (state.activeChatId && currentChat) {
          const chatData = {
            title: currentChat.title,
            role: selectedRole?.name || '기본 어시스턴트',
            messages: currentChat.messages,
            createdAt: currentChat.createdAt
          };
          
          const dataStr = JSON.stringify(chatData, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${currentChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
          link.click();
          URL.revokeObjectURL(url);
          
          toast.success('채팅이 내보내기 되었습니다.');
        }
      },

      handleChatSave: () => {
        if (state.activeChatId && currentChat) {
          updateConversation(state.activeChatId, { isPinned: true });
          toast.success('채팅이 즐겨찾기에 저장되었습니다.');
        }
      },

      handleChatDelete: () => {
        if (state.activeChatId) {
          if (confirm('이 채팅을 삭제하시겠습니까?')) {
            deleteConversation(state.activeChatId);
            setActiveChat(null);
            setSelectedRole(null);
            toast.success('채팅이 삭제되었습니다.');
          }
        }
      },

      handleChatArchive: () => {
        if (state.activeChatId && currentChat) {
          const isCurrentlyPinned = currentChat.isPinned;
          updateConversation(state.activeChatId, { isPinned: !isCurrentlyPinned });
          
          if (isCurrentlyPinned) {
            toast.success('채팅이 아카이브에서 제거되었습니다.');
          } else {
            toast.success('채팅이 아카이브에 보관되었습니다.');
          }
        } else {
          toast.error('선택된 채팅이 없습니다.');
        }
      },

      handleChatShare: () => {
        if (state.activeChatId && currentChat) {
          const shareText = `Role GPT 채팅: ${currentChat.title}`;
          
          if (navigator.share) {
            navigator.share({
              title: 'Role GPT 채팅 공유',
              text: shareText,
              url: window.location.href
            }).then(() => {
              toast.success('채팅이 공유되었습니다.');
            }).catch(() => {
              navigator.clipboard.writeText(shareText);
              toast.success('공유 링크가 클립보드에 복사되었습니다.');
            });
          } else {
            navigator.clipboard.writeText(shareText);
            toast.success('공유 링크가 클립보드에 복사되었습니다.');
          }
        }
      }
    };
  };

  return {
    handleSendMessage,
    handleRoleSelect,
    handleNewChat,
    handleChatSelect,
    handleNewProject,
    handleProjectSelectionModalSelect,
    handleProjectSelectionModalNewProject,
    getChatActionHandlers,
    updateConversation,
    updateProject,
    deleteProject,
    addProject,
    deleteConversation
  };
}