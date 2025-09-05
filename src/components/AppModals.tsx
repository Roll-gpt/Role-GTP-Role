import { RoleGptGallery } from './RoleGptGallery';
import { RoleLibrary } from './RoleLibrary';
import { RoleCategoryModal } from './RoleCategoryModal';
import { SafeSettingsModal } from './SafeSettingsModal';
import { NewProjectPage } from './NewProjectPage';
import { ProjectViewPage } from './ProjectViewPage';
import { ProjectGalleryPage } from './ProjectGalleryPage';
import { ProjectDeleteModal } from './ProjectDeleteModal';
import { IconPickerModal } from './IconPickerModal';
import { Toaster } from './ui/sonner';

interface AppModalsProps {
  // Gallery & Library states
  roleGptOpen: boolean;
  setRoleGptOpen: (open: boolean) => void;
  roleLibraryOpen: boolean;
  setRoleLibraryOpen: (open: boolean) => void;
  categoryModalOpen: boolean;
  setCategoryModalOpen: (open: boolean) => void;
  selectedCategory: string;
  categoryButtonPosition?: { x: number; y: number };
  
  // Settings states
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  
  // Project states
  newProjectOpen: boolean;
  setNewProjectOpen: (open: boolean) => void;
  projectViewOpen: boolean;
  setProjectViewOpen: (open: boolean) => void;
  projectGalleryOpen: boolean;
  setProjectGalleryOpen: (open: boolean) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projectDeleteModalOpen: boolean;
  setProjectDeleteModalOpen: (open: boolean) => void;
  projectToDelete: { id: string; title: string } | null;
  setProjectToDelete: (project: { id: string; title: string } | null) => void;
  
  // Icon picker states
  iconPickerOpen: boolean;
  setIconPickerOpen: (open: boolean) => void;
  iconPickerTarget: { type: 'chat' | 'project'; id: string } | null;
  setIconPickerTarget: (target: { type: 'chat' | 'project'; id: string } | null) => void;
  
  // Handlers
  onRoleSelect: (role: any) => void;
  onChatSelect: (chatId: string) => void;
  onProjectSelect: (projectId: string) => void;
  onProjectViewAll: () => void;
  onProjectDeleteConfirm: () => void;
  onProjectDeleteCancel: () => void;
  onIconSelect: (iconName: string) => void;
  onUpdateProject: (projectId: string, updates: any) => void;
  onAddProject: (project: any) => string;
  onDeleteProject: (projectId: string) => void;
  onChatRemoveFromProject: (chatId: string) => void;
  onDropChatToProject: (chatId: string, projectId: string) => void;
  
  // Data
  state: any;
  sidebarExpanded: boolean;
}

export function AppModals({
  roleGptOpen,
  setRoleGptOpen,
  roleLibraryOpen,
  setRoleLibraryOpen,
  categoryModalOpen,
  setCategoryModalOpen,
  selectedCategory,
  categoryButtonPosition,
  settingsOpen,
  setSettingsOpen,
  newProjectOpen,
  setNewProjectOpen,
  projectViewOpen,
  setProjectViewOpen,
  projectGalleryOpen,
  setProjectGalleryOpen,
  selectedProjectId,
  setSelectedProjectId,
  projectDeleteModalOpen,
  setProjectDeleteModalOpen,
  projectToDelete,
  setProjectToDelete,
  iconPickerOpen,
  setIconPickerOpen,
  iconPickerTarget,
  setIconPickerTarget,
  onRoleSelect,
  onChatSelect,
  onProjectSelect,
  onProjectViewAll,
  onProjectDeleteConfirm,
  onProjectDeleteCancel,
  onIconSelect,
  onUpdateProject,
  onAddProject,
  onDeleteProject,
  onChatRemoveFromProject,
  onDropChatToProject,
  state,
  sidebarExpanded
}: AppModalsProps) {
  return (
    <>
      {/* Role GPT Gallery Modal */}
      <RoleGptGallery
        isOpen={roleGptOpen}
        onClose={() => setRoleGptOpen(false)}
        onRoleSelect={onRoleSelect}
        selectedCategory={selectedCategory}
        onOpenLibrary={() => {
          setRoleGptOpen(false);
          setRoleLibraryOpen(true);
        }}
      />

      {/* Role Library Modal */}
      <RoleLibrary
        isOpen={roleLibraryOpen}
        onClose={() => setRoleLibraryOpen(false)}
        onRoleSelect={onRoleSelect}
      />

      {/* Role Category Modal */}
      <RoleCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={selectedCategory}
        onRoleSelect={onRoleSelect}
        buttonPosition={categoryButtonPosition}
      />

      {/* Settings Modal */}
      <SafeSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* New Project Sidebar */}
      {newProjectOpen && (
        <NewProjectPage
          isOpen={newProjectOpen}
          onClose={() => setNewProjectOpen(false)}
          fromGallery={projectGalleryOpen}
          sidebarExpanded={sidebarExpanded}
          onCreateProject={(projectData) => {
            const existingProject = state.projects.find((p: any) => p.title === projectData.title);
            
            if (existingProject) {
              onUpdateProject(existingProject.id, {
                description: projectData.description,
                guidelines: projectData.guidelines?.join('\n\n') || '',
                lastModified: new Date()
              });
              return existingProject.id;
            } else {
              return onAddProject({
                id: `project_${Date.now()}`,
                title: projectData.title,
                description: projectData.description,
                category: 'general',
                guidelines: projectData.guidelines?.join('\n\n') || '',
                createdAt: new Date(),
                lastModified: new Date(),
                chatCount: 0,
                isPinned: false
              });
            }
          }}
          onDeleteProject={onDeleteProject}
          onDuplicateProject={(projectData) => {
            onAddProject({
              id: `project_${Date.now()}`,
              title: projectData.title,
              description: projectData.description,
              category: 'general',
              guidelines: projectData.guidelines?.join('\n\n') || '',
              createdAt: new Date(),
              lastModified: new Date(),
              chatCount: 0,
              isPinned: false
            });
          }}
        />
      )}

      {/* Project View Page */}
      {projectViewOpen && (
        <ProjectViewPage
          isOpen={projectViewOpen}
          onClose={() => {
            setProjectViewOpen(false);
            setSelectedProjectId(null);
          }}
          project={selectedProjectId ? state.projects.find((p: any) => p.id === selectedProjectId) || null : null}
          projectChats={selectedProjectId ? state.conversations.filter((c: any) => c.projectId === selectedProjectId) : []}
          roles={state.roles}
          onUpdateProject={onUpdateProject}
          onChatSelect={(chatId) => {
            onChatSelect(chatId);
            setProjectViewOpen(false);
            setSelectedProjectId(null);
          }}
          onChatRemoveFromProject={onChatRemoveFromProject}
          onDropChatToProject={onDropChatToProject}
          sidebarExpanded={sidebarExpanded}
        />
      )}

      {/* Project Delete Modal */}
      <ProjectDeleteModal
        isOpen={projectDeleteModalOpen}
        onClose={onProjectDeleteCancel}
        onConfirm={onProjectDeleteConfirm}
        projectTitle={projectToDelete?.title || ''}
      />

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => {
          setIconPickerOpen(false);
          setIconPickerTarget(null);
        }}
        onIconSelect={onIconSelect}
        currentIcon={
          iconPickerTarget?.type === 'chat' 
            ? state.conversations.find((c: any) => c.id === iconPickerTarget.id)?.icon
            : iconPickerTarget?.type === 'project'
              ? state.projects.find((p: any) => p.id === iconPickerTarget.id)?.icon
              : undefined
        }
        title={
          iconPickerTarget?.type === 'chat' ? '채팅 아이콘 선택' : '프로젝트 아이콘 선택'
        }
      />

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}