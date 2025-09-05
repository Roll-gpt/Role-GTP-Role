/**
 * ChatSidebar - 메인 사이드바 컴포넌트
 * 
 * Role GPT의 핵심 네비게이션 인터페이스
 * - 채팅 내역 관리 및 탐색
 * - 프로젝트 기반 그룹핑
 * - Role 선택 캐로셀
 * - 통합 검색 기능
 * - 반응형 확장/축소 지원
 * 
 * @features
 * - 드래그 앤 드롭으로 채팅을 프로젝트에 추가
 * - 실시간 검색 (프로젝트 + 채팅)
 * - 핀 고정, 아이콘 변경 등 관리 기능
 * - 모바일 오버레이 지원
 */

import { useState } from "react";
import { useApp } from "../src/context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import {
  Plus,
  MessageSquare,
  Trash2,
  ExternalLink,
  LogOut,
  Settings,
  Users,
  BookOpen,
  Search,
  Edit,
  User,
  UserCog,
  ChevronLeft,
  ChevronRight,
  X,
  FolderPlus,
  MoreHorizontal,
  Edit3,
  Pin,
  Trash,
  Share,
  Archive,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Palette,
  HelpCircle,
  CreditCard,
} from "lucide-react";
import { IconRenderer } from './IconRenderer';
import { EnhancedSidebarCarousel } from './EnhancedSidebarCarousel';
import logo from "figma:asset/a68fb43a0014b2bfe230e515424245fd48949d41.png";

interface ChatSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  onSettingsClick?: () => void;
  onAccountClick?: () => void;
  onRoleGptClick?: () => void;
  onRoleLibraryClick?: () => void;
  onNewChat?: () => void;
  onCreateMockChat?: () => void;
  onNewProject?: () => void;
  onChatSelect?: (chatId: string) => void;
  onSearchClick?: () => void;
  onChatRename?: (chatId: string, newTitle: string) => void;
  onChatPin?: (chatId: string) => void;
  onChatDelete?: (chatId: string) => void;
  onChatExport?: (chatId: string) => void;
  onChatAddToProject?: (chatId: string) => void;
  onChatIconChange?: (chatId: string) => void;
  onProjectSelect?: (projectId: string) => void;
  onProjectRename?: (
    projectId: string,
    newTitle: string,
  ) => void;
  onProjectViewAll?: () => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectDuplicate?: (projectId: string) => void;
  onProjectIconChange?: (projectId: string) => void;
  onRoleSelect?: (role: any) => void;
  onChatHistoryViewAll?: () => void;
  chatHistory?: Array<{
    id: string;
    title: string;
    role: any;
    messages: any[];
    createdAt: Date;
    lastMessageAt: Date;
    isPinned?: boolean;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    createdAt: Date;
    lastModified: Date;
    chatCount: number;
    isPinned?: boolean;
  }>;
  currentChatId?: string | null;
  isMobile?: boolean;
}

/**
 * Role GPT 로고 컴포넌트
 * 사이드바 상태에 따라 다른 형태��� 렌더링
 */
const RoleGptLogo = ({
  isExpanded,
}: {
  isExpanded: boolean;
}) => {
  if (!isExpanded) {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <img
          src={logo}
          alt="Role GPT"
          className="w-6 h-6 object-contain filter brightness-0 invert"
        />
      </div>
    );
  }

  return (
    <div className="h-8 w-auto flex items-center gap-3">
      <div className="w-6 h-6 flex items-center justify-center">
        <img
          src={logo}
          alt="Role GPT"
          className="w-full h-full object-contain filter brightness-0 invert"
        />
      </div>
      <span className="text-lg font-medium">Role GPT</span>
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs px-2 py-0.5 rounded">
        Plus
      </div>
    </div>
  );
};

/**
 * 사이드바 메뉴 아이템 컴포넌트
 * 확장/축소 상태에 따라 다른 UI 제공
 */
const SidebarMenuItem = ({
  icon: Icon,
  children,
  onClick,
  isExpanded,
  tooltip,
}: {
  icon?: any;
  children: React.ReactNode;
  onClick?: () => void;
  isExpanded: boolean;
  tooltip?: string;
}) => {
  if (!isExpanded) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center p-2.5 text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all duration-200 group relative rounded-lg"
        title={
          tooltip ||
          (typeof children === "string" ? children : "")
        }
      >
        {Icon && <Icon className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all duration-200 rounded-lg"
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-left">{children}</span>
    </button>
  );
};

const ChatItem = ({
  chat,
  isActive,
  onSelect,
  onRename,
  onPin,
  onDelete,
  onExport,
  onAddToProject,
  onIconChange,
}: {
  chat: {
    id: string;
    title: string;
    role: any;
    messages: any[];
    createdAt: Date;
    lastMessageAt: Date;
    isPinned?: boolean;
    icon?: string;
  };
  isActive: boolean;
  onSelect: (chatId: string) => void;
  onRename?: (chatId: string, newTitle: string) => void;
  onPin?: (chatId: string) => void;
  onDelete?: (chatId: string) => void;
  onExport?: (chatId: string) => void;
  onAddToProject?: (chatId: string) => void;
  onIconChange?: (chatId: string) => void;
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== chat.title) {
      onRename?.(chat.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewTitle(chat.title);
      setIsRenaming(false);
    }
  };

  if (isRenaming) {
    return (
      <div className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-accent/20">
        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          className="flex-1 text-xs h-auto py-0 border-none bg-transparent focus:ring-0 focus:border-none"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      className={`group w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors hover:bg-accent/50 relative ${
        isActive
          ? "bg-accent/50 text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", chat.id);
        e.dataTransfer.effectAllowed = "move";
      }}
    >
      {/* Chat content - clickable area */}
      <button
        onClick={() => onSelect(chat.id)}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onIconChange?.(chat.id);
            }}
            className="hover:bg-accent/50 rounded p-0.5 transition-colors"
          >
            {chat.icon ? (
              <IconRenderer iconName={chat.icon} className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            )}
          </button>
          {chat.isPinned && (
            <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-xs font-normal">
            {chat.title}
          </div>
          {chat.role && (
            <div className="text-xs text-muted-foreground/70 truncate font-normal">
              {chat.role.name}와의 대화
            </div>
          )}
        </div>
      </button>

      {/* Options menu - only visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 hover:bg-accent text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </Button>

        {/* Custom dropdown menu */}
        {showMenu && (
          <>
            {/* Overlay to close menu */}
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu content */}
            <div className="absolute right-0 top-full mt-1 w-44 bg-background border border-border rounded-md shadow-lg z-[70] py-1">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPin?.(chat.id);
                  setShowMenu(false);
                }}
              >
                <Pin className="w-4 h-4" />
                {chat.isPinned ? "핀 해제" : "핀 고정"}
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExport?.(chat.id);
                  setShowMenu(false);
                }}
              >
                <Share className="w-4 h-4" />
                공유하기
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRenaming(true);
                  setNewTitle(chat.title);
                  setShowMenu(false);
                }}
              >
                <Edit3 className="w-4 h-4" />
                이름 바꾸기
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddToProject?.(chat.id);
                  setShowMenu(false);
                }}
              >
                <FolderOpen className="w-4 h-4" />
                프로젝트에 추가
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onIconChange?.(chat.id);
                  setShowMenu(false);
                }}
              >
                <Palette className="w-4 h-4" />
                아이콘 변경
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-destructive text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(chat.id);
                  setShowMenu(false);
                }}
              >
                <Trash className="w-4 h-4" />
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ProjectItem = ({
  project,
  onSelect,
  onRename,
  onDelete,
  onDuplicate,
  onIconChange,
  onViewAll,
}: {
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    createdAt: Date;
    lastModified: Date;
    chatCount: number;
    isPinned?: boolean;
    icon?: string;
  };
  onSelect?: (projectId: string) => void;
  onRename?: (projectId: string, newTitle: string) => void;
  onDelete?: (projectId: string) => void;
  onDuplicate?: (projectId: string) => void;
  onIconChange?: (projectId: string) => void;
  onViewAll?: () => void;
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(project.title);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    if (newTitle.trim() && newTitle !== project.title) {
      onRename?.(project.id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewTitle(project.title);
      setIsRenaming(false);
    }
  };

  if (isRenaming) {
    return (
      <div className="w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-accent/20">
        <FolderPlus className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={handleKeyDown}
          className="flex-1 text-xs h-auto py-0 border-none bg-transparent focus:ring-0 focus:border-none"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="group w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left rounded-md transition-colors hover:bg-accent/50 text-muted-foreground hover:text-foreground relative">
      {/* Project content - clickable area */}
      <button
        onClick={() => onSelect?.(project.id)}
        onDoubleClick={() => onViewAll?.()}
        className="flex items-center gap-2 flex-1 min-w-0 text-left"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onIconChange?.(project.id);
          }}
          className="hover:bg-accent/50 rounded p-0.5 transition-colors"
        >
          {project.icon ? (
            <IconRenderer iconName={project.icon} className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <FolderPlus className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="truncate text-xs font-normal">
            {project.title}
          </div>
          <div className="text-xs text-muted-foreground/70 truncate font-normal">
            {project.chatCount}개 채팅
          </div>
        </div>
      </button>

      {/* Options menu - only visible on hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 hover:bg-accent text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
        >
          <MoreHorizontal className="w-3 h-3" />
        </Button>

        {/* Custom dropdown menu */}
        {showMenu && (
          <>
            {/* Overlay to close menu */}
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu content */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-[70] py-1">
              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRenaming(true);
                  setNewTitle(project.title);
                  setShowMenu(false);
                }}
              >
                <Edit3 className="w-4 h-4" />
                이름 바꾸기
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDuplicate?.(project.id);
                  setShowMenu(false);
                }}
              >
                <Copy className="w-4 h-4" />
                복제
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-foreground text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onIconChange?.(project.id);
                  setShowMenu(false);
                }}
              >
                <Palette className="w-4 h-4" />
                아이콘 변경
              </button>

              <button
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent text-destructive text-left transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(project.id);
                  setShowMenu(false);
                }}
              >
                <Trash className="w-4 h-4" />
                항목 삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export function ChatSidebar({
  isExpanded,
  onToggle,
  onSettingsClick,
  onAccountClick,
  onRoleGptClick,
  onRoleLibraryClick,
  onNewChat,
  onCreateMockChat,
  onNewProject,
  onChatSelect,
  onSearchClick,
  onChatRename,
  onChatPin,
  onChatDelete,
  onChatExport,
  onChatAddToProject,
  onChatIconChange,
  onProjectSelect,
  onProjectRename,
  onProjectViewAll,
  onProjectDelete,
  onProjectDuplicate,
  onProjectIconChange,
  onRoleSelect,
  onChatHistoryViewAll,
  chatHistory = [],
  projects = [],
  currentChatId,
  isMobile = false,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
  const [isChatHistoryExpanded, setIsChatHistoryExpanded] = useState(true);
  const [showMoreProjects, setShowMoreProjects] = useState(false);
  const [showMoreChats, setShowMoreChats] = useState(false);
  const { state } = useApp();
  const isAdvancedMode = state.userSettings.mode === "advanced";
  
  // 프로젝트와 채팅 더보기 설정
  const INITIAL_PROJECT_COUNT = 10;
  const INITIAL_CHAT_COUNT = 10;

  // 통합 검색 로직 - 프로젝트와 채팅 모두 검색
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = chatHistory.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 정렬 로직
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
  });

  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  // 표시할 아이템 개수 결정
  const visibleProjects = showMoreProjects ? sortedProjects : sortedProjects.slice(0, INITIAL_PROJECT_COUNT);
  const visibleChats = showMoreChats ? sortedChats : sortedChats.slice(0, INITIAL_CHAT_COUNT);

  return (
    <>
      {/* Overlay Background when expanded */}
      {isExpanded && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 z-50 h-full flex flex-col
        bg-background border-r border-border shadow-lg
        transition-all duration-300 ease-in-out
        ${isMobile 
          ? `w-[75vw] ${isExpanded ? 'left-0' : '-left-[75vw]'}` 
          : `${isExpanded ? 'w-76 left-0' : 'w-16 left-0'}`
        }
      `}
      >
        {isMobile || isExpanded ? (
          /* Header Section - 확장된 모드 */
          <div className="flex-shrink-0">
            {/* Logo */}
            <div className="p-5 flex items-center justify-start">
              <RoleGptLogo isExpanded={true} />
            </div>

            {/* Top Menu Items */}
            <div className="px-3 py-3 space-y-3">
              {/* 추천 Role 캐러셀 */}
              <EnhancedSidebarCarousel 
                onRoleSelect={onRoleSelect}
                isExpanded={true}
              />

              {/* 구분선 */}
              <div className="h-px bg-border/30" />

              {/* 통합 검색창 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="프로젝트, 채팅 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 bg-accent/20 border-border/40 text-sm h-10 rounded-lg"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Main Menu Items */}
              <div className="space-y-1">
                <SidebarMenuItem icon={Users} isExpanded={true} onClick={onRoleGptClick}>
                  Role 갤러리
                </SidebarMenuItem>

                <SidebarMenuItem icon={BookOpen} isExpanded={true} onClick={onRoleLibraryClick}>
                  내 Role 라이브러리
                </SidebarMenuItem>

                <SidebarMenuItem icon={FolderPlus} isExpanded={true} onClick={onNewProject}>
                  새 프로젝트
                </SidebarMenuItem>

                {/* 개발용: 목업 채팅 생성 */}
                <SidebarMenuItem icon={MessageSquare} isExpanded={true} onClick={onCreateMockChat}>
                  목업 채팅 보기
                </SidebarMenuItem>
              </div>
            </div>
          </div>
        ) : (
          /* 축소된 모드 - 전체 높이 활용 */
          <>
            {/* Header Section - 축소된 모드 */}
            <div className="flex-shrink-0">
              {/* Logo */}
              <div className="p-3 flex items-center justify-center">
                <RoleGptLogo isExpanded={false} />
              </div>

              {/* Top Menu Items */}
              <div className="px-2 py-3 space-y-2">
                <EnhancedSidebarCarousel onRoleSelect={onRoleSelect} isExpanded={false} />
                <div className="h-px bg-border/30 mx-2" />
                <SidebarMenuItem icon={Users} isExpanded={false} tooltip="Role 갤러리" onClick={onRoleGptClick} />
                <SidebarMenuItem icon={FolderPlus} isExpanded={false} tooltip="새 프로젝트" onClick={onNewProject} />
                <SidebarMenuItem icon={MessageSquare} isExpanded={false} tooltip="목업 채팅 보기" onClick={onCreateMockChat} />
              </div>
            </div>

            {/* Bottom section - User/Settings 하단 고정 */}
            <div className="flex-1"></div>
            <div className="flex-shrink-0 pb-3 px-2 space-y-2">
              <SidebarMenuItem 
                icon={User} 
                isExpanded={false} 
                tooltip="내 계정" 
                onClick={onAccountClick}
              />
              <SidebarMenuItem 
                icon={Settings} 
                isExpanded={false} 
                tooltip="설정" 
                onClick={onSettingsClick}
              />
            </div>
          </>
        )}

        {/* Scrollable Content Area - 확장된 모드에서만 표시 */}
        {(isMobile || isExpanded) && (
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* Level 1: 전체 스크롤 가능 영역 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 scrollbar-thin">
              <div className="space-y-6">
                {/* 프로젝트 섹션 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isProjectsExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      프로젝트
                      {filteredProjects.length > 0 && (
                        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {filteredProjects.length}
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={onNewProject}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors hover:bg-accent/50 rounded p-1"
                        title="새 프로젝트"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={onProjectViewAll}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        전체 보기
                      </button>
                    </div>
                  </div>
                  
                  {isProjectsExpanded && (
                    <div className="border border-border/30 rounded-md bg-background/30 backdrop-blur-sm">
                      {/* Level 2: 프로젝트 독립 스크롤 영역 */}
                      <div 
                        className={`
                          p-2 
                          ${sortedProjects.length > 6 ? 'max-h-80 overflow-y-auto' : 'max-h-none'} 
                          sidebar-section-scroll
                        `}
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
                        }}
                      >
                        <div className="space-y-1">
                          {visibleProjects.length > 0 ? (
                            <>
                              {visibleProjects.map((project) => (
                                <ProjectItem
                                  key={project.id}
                                  project={project}
                                  onSelect={onProjectSelect}
                                  onRename={onProjectRename}
                                  onDelete={onProjectDelete}
                                  onDuplicate={onProjectDuplicate}
                                  onIconChange={onProjectIconChange}
                                  onViewAll={onProjectViewAll}
                                />
                              ))}
                              
                              {/* 더보기 버튼 */}
                              {sortedProjects.length > INITIAL_PROJECT_COUNT && !showMoreProjects && (
                                <button
                                  onClick={() => setShowMoreProjects(true)}
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors rounded-md"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                  {sortedProjects.length - INITIAL_PROJECT_COUNT}개 더보기
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-4 text-xs text-muted-foreground">
                              아직 프로젝트가 없습니다
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 채팅 히스토리 섹션 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setIsChatHistoryExpanded(!isChatHistoryExpanded)}
                      className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isChatHistoryExpanded ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      채팅 기록
                      {filteredChats.length > 0 && (
                        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {filteredChats.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={onChatHistoryViewAll}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      전체 보기
                    </button>
                  </div>
                  
                  {isChatHistoryExpanded && (
                    <div className="border border-border/30 rounded-md bg-background/30 backdrop-blur-sm">
                      {/* Level 2: 채팅 독립 스크롤 영역 */}
                      <div 
                        className={`
                          p-2 
                          ${sortedChats.length > 8 ? 'max-h-96 overflow-y-auto' : 'max-h-none'} 
                          sidebar-section-scroll
                        `}
                        style={{ 
                          scrollbarWidth: 'thin',
                          scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent'
                        }}
                      >
                        <div className="space-y-1">
                          {visibleChats.length > 0 ? (
                            <>
                              {visibleChats.map((chat) => (
                                <ChatItem
                                  key={chat.id}
                                  chat={chat}
                                  isActive={chat.id === currentChatId}
                                  onSelect={onChatSelect!}
                                  onRename={onChatRename}
                                  onPin={onChatPin}
                                  onDelete={onChatDelete}
                                  onExport={onChatExport}
                                  onAddToProject={onChatAddToProject}
                                  onIconChange={onChatIconChange}
                                />
                              ))}
                              
                              {/* 더보기 버튼 */}
                              {sortedChats.length > INITIAL_CHAT_COUNT && !showMoreChats && (
                                <button
                                  onClick={() => setShowMoreChats(true)}
                                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors rounded-md"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                  {sortedChats.length - INITIAL_CHAT_COUNT}개 더보기
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-4 text-xs text-muted-foreground">
                              아직 채팅 기록이 없습니다
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom User Section - 고정 */}
        <div className="flex-shrink-0 border-t border-border/30">
          {(isMobile || isExpanded) ? (
            // 확장 모드: 깔끔한 사용자 섹션
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={onAccountClick}
                  className="flex items-center gap-3 flex-1 px-3 py-2 rounded-lg hover:bg-accent/40 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-medium text-foreground truncate">
                      사용자
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      Free Plan
                    </div>
                  </div>
                </button>
                <button
                  onClick={onSettingsClick}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
                  title="환경 설정"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            // 축소 모드: 간단한 설정 아이콘들
            <div className="px-2 py-3 space-y-2">
              <div className="h-px bg-border/30 mx-2" />
              <SidebarMenuItem 
                icon={UserCog} 
                isExpanded={false} 
                tooltip="계정 설정" 
                onClick={onAccountClick} 
              />
              <SidebarMenuItem 
                icon={Settings} 
                isExpanded={false} 
                tooltip="환경 설정" 
                onClick={onSettingsClick} 
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}