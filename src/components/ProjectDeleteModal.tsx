import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ProjectDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectTitle: string;
}

export function ProjectDeleteModal({ isOpen, onClose, onConfirm, projectTitle }: ProjectDeleteModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left">프로젝트 삭제</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left">
            <span className="font-medium">"{projectTitle}"</span> 프로젝트를 정말 삭제하시겠습니까?
            <br />
            <span className="text-muted-foreground/80 text-sm mt-1 block">
              이 작업은 되돌릴 수 없습니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}