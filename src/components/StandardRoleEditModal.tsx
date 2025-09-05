import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { ArrowLeft, Save, Sparkles, User, Briefcase, Heart, Lightbulb, Target, GraduationCap, Star, Plus, X, AlertTriangle } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { Role } from '../src/types';

interface StandardRoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
  onSave?: (role: Role) => void;
}

const categoryIcons = {
  recommended: Star,
  popular: Sparkles,
  lifestyle: Heart,
  creativity: Lightbulb,
  productivity: Target,
  education: GraduationCap,
  expert: Briefcase,
  custom: User
};

const categoryLabels = {
  recommended: '추천',
  popular: '인기',
  lifestyle: '라이프 스타일',
  creativity: '창의성',
  productivity: '생산성',
  education: '학습 및 교육',
  expert: '전문가',
  custom: '사용자 정의'
};

export function StandardRoleEditModal({ isOpen, onClose, roleToEdit, onSave }: StandardRoleEditModalProps) {
  const { addRole, updateRole, state } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as keyof typeof categoryLabels,
    prompt: ''
  });

  // 응답 방식 키워드 상태 (Standard: 최대 3개)
  const [responseKeywords, setResponseKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    if (roleToEdit) {
      setFormData({
        name: roleToEdit.name,
        description: roleToEdit.description,
        category: roleToEdit.category as keyof typeof categoryLabels,
        prompt: roleToEdit.prompt
      });
      
      // 기존 키워드 로드
      const keywords = roleToEdit.keywordIds?.map(id => 
        state.masterKeywords.find(k => k.id === id)?.name || ''
      ).filter(name => name !== '') || [];
      setResponseKeywords(keywords);
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'custom',
        prompt: ''
      });
      setResponseKeywords([]);
    }
    setNewKeyword('');
  }, [roleToEdit, isOpen, state.masterKeywords]);

  // 키워드 관리 함수들
  const addKeyword = () => {
    if (newKeyword.trim() && responseKeywords.length < 3 && !responseKeywords.includes(newKeyword.trim())) {
      setResponseKeywords([...responseKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setResponseKeywords(responseKeywords.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // 키워드들을 마스터 키워드로 변환/추가
    const keywordIds: string[] = [];
    responseKeywords.forEach(keywordName => {
      let keyword = state.masterKeywords.find(k => k.name === keywordName);
      if (!keyword) {
        // 새 키워드 생성
        keyword = {
          id: `keyword_${Date.now()}_${Math.random()}`,
          name: keywordName,
          description: `사용자 정의 응답 방식: ${keywordName}`
        };
        // 마스터 키워드에 추가하는 로직이 필요하지만, 일단 기존 ID만 사용
      }
      keywordIds.push(keyword.id);
    });

    const role: Role = {
      id: roleToEdit?.id || `custom_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      prompt: formData.prompt,
      category: formData.category,
      keywordIds: keywordIds,
      temperature: 0.7,
      maxOutputTokens: 2048,
      safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
      isCustom: true
    };

    if (roleToEdit) {
      updateRole(roleToEdit.id, role);
    } else {
      addRole(role);
    }

    if (onSave) {
      onSave(role);
    }

    onClose();
  };

  const isValid = formData.name && formData.description && formData.prompt;

  const presetPrompts = [
    {
      title: '친근한 도우미',
      prompt: '당신은 친근하고 도움이 되는 어시스턴트입니다. 항상 긍정적이고 격려하는 톤으로 대화하며, 사용자의 질문에 명확하고 유용한 답변을 제공합니다.'
    },
    {
      title: '전문 컨설턴트',
      prompt: '당신은 해당 분야의 전문가입니다. 풍부한 경험과 지식을 바탕으로 전문적이고 신뢰할 수 있는 조언을 제공합니다. 항상 논리적이고 구체적인 답변을 합니다.'
    },
    {
      title: '창의적 파트너',
      prompt: '당신은 창의적이고 혁신적인 아이디어를 제공하는 파트너입니다. 틀에 얽매이지 않는 사고로 새로운 관점과 독창적인 솔루션을 제안합니다.'
    },
    {
      title: '학습 멘토',
      prompt: '당신은 인내심 많은 학습 멘토입니다. 복잡한 개념을 이해하기 쉽게 설명하고, 단계별로 체계적인 학습 방법을 제시합니다.'
    }
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {roleToEdit ? 'Role 편집' : '새 Role 만들기'}
          </DialogTitle>
          <DialogDescription>
            {roleToEdit ? 'Role의 정보를 수정하세요.' : '나만의 맞춤형 Role을 만들어보세요.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Role 이름</Label>
              <Input
                id="name"
                placeholder="예: 개인 트레이너"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">간단한 설명</Label>
              <Input
                id="description"
                placeholder="예: 운동과 건강 관리를 도와주는 전문가"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">카테고리</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as keyof typeof categoryLabels })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => {
                    const Icon = categoryIcons[key as keyof typeof categoryIcons];
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 응답 방식 섹션 */}
          <div className="space-y-4">
            <div>
              <Label>응답 방식</Label>
              <p className="text-sm text-muted-foreground mb-3">
                AI가 어떤 스타일로 응답할지 키워드를 선택해주세요. (최대 3개)
              </p>

              {/* 경고 메시지 */}
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    ⚠️ 서로 상반된 키워드를 동시에 선택하면 AI의 응답이 부정확해질 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 키워드 슬롯들 (5-6개) */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="relative">
                    {responseKeywords[index] ? (
                      <div className="flex items-center justify-between p-3 bg-primary/10 border-2 border-primary rounded-lg">
                        <span className="text-sm font-medium truncate">
                          {responseKeywords[index]}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => removeKeyword(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-12 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground/50">
                        <span className="text-xs">빈 슬롯</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 새 키워드 추가 */}
              {responseKeywords.length < 3 && (
                <div className="flex gap-2">
                  <Input
                    placeholder="새 응답 방식 키워드 추가..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={addKeyword} 
                    disabled={!newKeyword.trim() || responseKeywords.includes(newKeyword.trim())}
                    size="icon"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* 추천 키워드들 */}
              <div>
                <Label className="text-sm">추천 키워드</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['친근한', '전문적인', '간결한', '상세한', '격려하는', '논리적인', '창의적인', '단계별'].map((keyword) => (
                    <Button
                      key={keyword}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        if (responseKeywords.length < 3 && !responseKeywords.includes(keyword)) {
                          setResponseKeywords([...responseKeywords, keyword]);
                        }
                      }}
                      disabled={responseKeywords.length >= 3 || responseKeywords.includes(keyword)}
                    >
                      {keyword}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 프롬프트 섹션 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt">Role 설명 (프롬프트)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                이 Role이 어떻게 행동해야 하는지 자세히 설명해주세요.
              </p>
              <Textarea
                id="prompt"
                placeholder="예: 당신은 경험 많은 개인 트레이너입니다. 운동 계획을 세우고, 올바른 자세를 가르치며, 건강한 생활 습관을 제안합니다..."
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                rows={6}
              />
            </div>

            {/* 프롬프트 템플릿 */}
            <div>
              <Label>프롬프트 템플릿</Label>
              <p className="text-sm text-muted-foreground mb-3">
                아래 템플릿을 참고하여 프롬프트를 작성해보세요.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {presetPrompts.map((preset, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setFormData({ ...formData, prompt: preset.prompt })}
                  >
                    <div className="font-medium text-sm mb-1">{preset.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {preset.prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Standard 모드 안내 */}
          <div className="p-4 bg-muted/30 rounded-lg border border-muted">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <div className="font-medium text-sm mb-1">Standard 모드</div>
                <div className="text-sm text-muted-foreground">
                  간단하고 사용하기 쉬운 설정으로 빠르게 Role을 만들 수 있습니다. 
                  고급 설정은 Advanced 모드에서 이용하실 수 있습니다.
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={!isValid}>
              <Save className="h-4 w-4 mr-2" />
              {roleToEdit ? '수정 완료' : 'Role 만들기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}