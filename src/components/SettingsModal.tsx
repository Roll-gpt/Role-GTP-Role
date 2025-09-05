import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { X, User, Moon, Sun, Monitor, Globe, Bell, Shield } from 'lucide-react';
import { useApp } from '../src/context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, updateSettings } = useApp();
  
  // Local state for form
  const [theme, setTheme] = useState(state.userSettings.theme);
  const [language, setLanguage] = useState(state.userSettings.language);
  const [notifications, setNotifications] = useState(state.userSettings.notifications.enabled);
  const [desktopNotifications, setDesktopNotifications] = useState(state.userSettings.notifications.desktop);
  const [soundNotifications, setSoundNotifications] = useState(state.userSettings.notifications.sound);
  const [dataCollection, setDataCollection] = useState(state.userSettings.privacy.dataCollection);
  const [analytics, setAnalytics] = useState(state.userSettings.privacy.analytics);
  
  // Update local state when settings change
  useEffect(() => {
    setTheme(state.userSettings.theme);
    setLanguage(state.userSettings.language);
    setNotifications(state.userSettings.notifications.enabled);
    setDesktopNotifications(state.userSettings.notifications.desktop);
    setSoundNotifications(state.userSettings.notifications.sound);
    setDataCollection(state.userSettings.privacy.dataCollection);
    setAnalytics(state.userSettings.privacy.analytics);
  }, [state.userSettings]);

  const handleSave = () => {
    updateSettings({
      theme,
      language,
      notifications: {
        ...state.userSettings.notifications,
        enabled: notifications,
        desktop: desktopNotifications,
        sound: soundNotifications,
      },
      privacy: {
        ...state.userSettings.privacy,
        dataCollection,
        analytics,
      },
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-medium">설정</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <DialogDescription className="sr-only">
          계정, 테마, 언어, 알림 및 개인정보 설정을 관리할 수 있습니다.
        </DialogDescription>

        <div className="space-y-6 py-4">
          {/* 계정 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">계정</h3>
            </div>
            <div className="pl-8 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">프로필 설정</p>
                  <p className="text-sm text-muted-foreground">이름, 이메일 등을 변경할 수 있습니다</p>
                </div>
                <Button variant="outline" size="sm">편집</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">구독 관리</p>
                  <p className="text-sm text-muted-foreground">ChatGPT Plus 구독을 관리합니다</p>
                </div>
                <Button variant="outline" size="sm">관리</Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* 테마 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">테마</h3>
            </div>
            <div className="pl-8 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">테마 설정</p>
                  <p className="text-sm text-muted-foreground">시스템 설정을 따르거나 직접 선택</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">라이트</SelectItem>
                    <SelectItem value="dark">다크</SelectItem>
                    <SelectItem value="system">시스템</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* 언어 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">언어</h3>
            </div>
            <div className="pl-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">인터페이스 언어</p>
                  <p className="text-sm text-muted-foreground">ChatGPT 인터페이스의 언어를 선택합니다</p>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ko">한국어</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* 알림 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">알림</h3>
            </div>
            <div className="pl-8 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">푸시 알림</p>
                  <p className="text-sm text-muted-foreground">새로운 기능이나 업데이트 알림을 받습니다</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">이메일 알림</p>
                  <p className="text-sm text-muted-foreground">중요한 업데이트를 이메일로 받습니다</p>
                </div>
                <Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
              </div>
            </div>
          </div>

          <Separator />

          {/* 개인정보 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">개인정보 및 데이터</h3>
            </div>
            <div className="pl-8 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">채팅 자동 저장</p>
                  <p className="text-sm text-muted-foreground">채팅 내용을 자동으로 저장합니다</p>
                </div>
                <Switch checked={dataCollection} onCheckedChange={setDataCollection} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">데이터 내보내기</p>
                  <p className="text-sm text-muted-foreground">내 채팅 데이터를 다운로드합니다</p>
                </div>
                <Button variant="outline" size="sm">다운로드</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-destructive">모든 데이터 삭제</p>
                  <p className="text-sm text-muted-foreground">모든 채팅 기록을 영구적으로 삭제합니다</p>
                </div>
                <Button variant="destructive" size="sm">삭제</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}