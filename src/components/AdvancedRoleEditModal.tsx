import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Save, Settings, User, Briefcase, Heart, Lightbulb, Target, GraduationCap, Star, Zap, Shield, Brain, Sparkles, Hash, Plus, X, AlertTriangle, Edit } from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { Role } from '../src/types';

interface AdvancedRoleEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleToEdit?: Role | null;
  onSave?: (role: Role) => void;
  expertMode?: boolean;
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

const safetyLevels = {
  BLOCK_NONE: '차단 안함',
  BLOCK_FEW: '일부 차단',
  BLOCK_SOME: '보통 차단',
  BLOCK_MEDIUM_AND_ABOVE: '중간 이상 차단',
  BLOCK_MOST: '대부분 차단'
};

export function AdvancedRoleEditModal({ isOpen, onClose, roleToEdit, onSave, expertMode = false }: AdvancedRoleEditModalProps) {
  const { addRole, updateRole, state } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as keyof typeof categoryLabels,
    prompt: '',
    temperature: 0.7,
    maxOutputTokens: 2048,
    safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE' as keyof typeof safetyLevels,
    keywordIds: [] as string[]
  });

  // 응답 방식 키워드 관리 (Advanced: 최대 5개, Expert: 무제한)
  const [responseKeywords, setResponseKeywords] = useState<Array<{name: string, description: string}>>([]);
  const [newKeyword, setNewKeyword] = useState({ name: '', description: '' });
  const [editingKeywordIndex, setEditingKeywordIndex] = useState<number | null>(null);

  useEffect(() => {
    if (roleToEdit) {
      setFormData({
        name: roleToEdit.name,
        description: roleToEdit.description,
        category: roleToEdit.category as keyof typeof categoryLabels,
        prompt: roleToEdit.prompt,
        temperature: roleToEdit.temperature || 0.7,
        maxOutputTokens: roleToEdit.maxOutputTokens || 2048,
        safetyLevel: roleToEdit.safetyLevel as keyof typeof safetyLevels || 'BLOCK_MEDIUM_AND_ABOVE',
        keywordIds: roleToEdit.keywordIds || []
      });
      
      // 기존 키워드 로드
      const keywords = roleToEdit.keywordIds?.map(id => {
        const keyword = state.masterKeywords.find(k => k.id === id);
        return keyword ? { name: keyword.name, description: keyword.description } : null;
      }).filter(k => k !== null) as Array<{name: string, description: string}> || [];
      setResponseKeywords(keywords);
    } else {
      setFormData({
        name: '',
        description: '',
        category: 'custom',
        prompt: '',
        temperature: 0.7,
        maxOutputTokens: 2048,
        safetyLevel: 'BLOCK_MEDIUM_AND_ABOVE',
        keywordIds: []
      });
      setResponseKeywords([]);
    }
    setNewKeyword({ name: '', description: '' });
    setEditingKeywordIndex(null);
  }, [roleToEdit, isOpen, state.masterKeywords]);

  const handleSave = () => {
    // 응답 방식 키워드들을 마스터 키워드로 변환/추가
    const keywordIds: string[] = [];
    responseKeywords.forEach(keywordData => {
      let keyword = state.masterKeywords.find(k => k.name === keywordData.name);
      if (!keyword) {
        // 새 키워드 생성
        keyword = {
          id: `keyword_${Date.now()}_${Math.random()}`,
          name: keywordData.name,
          description: keywordData.description
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
      temperature: formData.temperature,
      maxOutputTokens: formData.maxOutputTokens,
      safetyLevel: formData.safetyLevel,
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

  // 응답 방식 키워드 관리 함수들
  const maxKeywords = expertMode ? -1 : 5; // Expert는 무제한, Advanced는 5개

  const addKeyword = () => {
    if (newKeyword.name.trim() && newKeyword.description.trim()) {
      if (maxKeywords === -1 || responseKeywords.length < maxKeywords) {
        if (!responseKeywords.some(k => k.name === newKeyword.name.trim())) {
          setResponseKeywords([...responseKeywords, {
            name: newKeyword.name.trim(),
            description: newKeyword.description.trim()
          }]);
          setNewKeyword({ name: '', description: '' });
        }
      }
    }
  };

  const removeKeyword = (index: number) => {
    setResponseKeywords(responseKeywords.filter((_, i) => i !== index));
  };

  const updateKeyword = (index: number, updatedKeyword: {name: string, description: string}) => {
    const updated = [...responseKeywords];
    updated[index] = updatedKeyword;
    setResponseKeywords(updated);
    setEditingKeywordIndex(null);
  };

  const handleKeywordToggle = (keywordId: string) => {
    setFormData({
      ...formData,
      keywordIds: formData.keywordIds.includes(keywordId)
        ? formData.keywordIds.filter(id => id !== keywordId)
        : [...formData.keywordIds, keywordId]
    });
  };

  const presetPrompts = [
    {
      title: '전문 컨설턴트',
      prompt: `당신은 해당 분야의 전문가입니다. 다음과 같은 특징을 가지고 있습니다:

- 10년 이상의 실무 경험
- 데이터와 사실에 기반한 분석
- 체계적이고 논리적인 접근 방식
- 실행 가능한 구체적 조언 제공

항상 전문적인 톤을 유지하며, 질문의 맥락을 정확히 파악하고 단계별로 상세한 답변을 제공합니다.`
    },
    {
      title: '창의적 파트너',
      prompt: `당신은 창의적이고 혁신적인 파트너입니다. 다음과 같은 특징을 가지고 있습니다:

- 틀에 얽매이지 않는 자유로운 사고
- 다양한 관점에서의 문제 접근
- 독창적이고 참신한 아이디어 제시
- 브레인스토밍과 연상을 통한 창의적 솔루션

항상 긍정적이고 열린 마음으로 새로운 가능성을 탐구하며, 기존의 한계를 뛰어넘는 제안을 합니다.`
    },
    {
      title: '학습 멘토',
      prompt: `당신은 인내심 많고 체계적인 학습 멘토입니다. 다음과 같은 특징을 가지고 있습니다:

- 개인의 학습 수준과 속도 고려
- 복잡한 개념을 간단하고 이해하기 쉽게 설명
- 단계별 학습 계획 제시
- 격려와 동기부여를 통한 지속적 지원

항상 학습자의 관점에서 생각하며, 실수를 두려워하지 않고 성장할 수 있는 환경을 조성합니다.`
    }
  ];

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {expertMode ? <Sparkles className="h-5 w-5 text-purple-600" /> : <Settings className="h-5 w-5" />}
            {expertMode 
              ? (roleToEdit ? 'Expert Role 편집' : '새 Expert Role 만들기')
              : (roleToEdit ? 'Advanced Role 편집' : '새 Advanced Role 만들기')
            }
          </DialogTitle>
          <DialogDescription>
            {expertMode 
              ? '전문가 수준의 모든 설정을 세밀하게 조정하여 최적화된 Role을 만들어보세요.'
              : '모든 설정을 세밀하게 조정하여 완벽한 Role을 만들어보세요.'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className={`grid w-full ${expertMode ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="prompt">프롬프트</TabsTrigger>
            <TabsTrigger value="keywords">응답 방식</TabsTrigger>
            <TabsTrigger value="advanced">고급 설정</TabsTrigger>
            {expertMode && (
              <TabsTrigger value="expert">전문가</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Role 기본 정보
                </CardTitle>
                <CardDescription>
                  Role의 이름, 설명, 카테고리를 설정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Role 이름</Label>
                  <Input
                    id="name"
                    placeholder="예: 시니어 마케팅 전략가"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">상세 설명</Label>
                  <Textarea
                    id="description"
                    placeholder="예: 10년 이상의 경험을 가진 디지털 마케팅과 브랜드 전략 전문가로, 데이터 기반 의사결정과 ROI 최적화에 특화되어 있습니다."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  프롬프트 설정
                </CardTitle>
                <CardDescription>
                  Role의 행동 방식과 응답 스타일을 정의하는 프롬프트를 작성하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Role 프롬프트</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Role의 전문성, 특징, 응답 스타일 등을 자세히 설명해주세요..."
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    rows={8}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">
                      {formData.prompt.length} 문자
                    </span>
                  </div>
                </div>

                <div>
                  <Label>프롬프트 템플릿</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {presetPrompts.map((preset, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setFormData({ ...formData, prompt: preset.prompt })}
                      >
                        <div className="font-medium text-sm mb-2">{preset.title}</div>
                        <div className="text-xs text-muted-foreground whitespace-pre-line">
                          {preset.prompt.substring(0, 200)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  응답 방식 설정
                </CardTitle>
                <CardDescription>
                  AI가 어떤 스타일로 응답할지 키워드를 추가하고 편집하세요.
                  {!expertMode && ' (최대 5개)'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 경고 메시지 */}
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                          ⚠️ 선택한 키워드가 많아질수록 응답이 길고 복잡해질 수 있습니다.
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          ⚠️ 상반된 키워드를 함께 사용하면 일관성이 떨어질 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  {expertMode && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                            ⚠️ 키워드 개수가 많아질 경우 컨텍스트가 폭발적으로 증가할 수 있습니다.
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            ⚠️ 지나친 조건은 AI의 응답 품질을 저하시킬 수 있습니다.
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            ⚠️ 불필요한 키워드를 줄이는 것이 더 나은 대화를 보장합니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 현재 키워드들 */}
                <div>
                  <Label className="text-sm font-medium">현재 응답 방식 키워드</Label>
                  <div className="mt-3 space-y-3">
                    {responseKeywords.map((keyword, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/20">
                        {editingKeywordIndex === index ? (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-xs">키워드 이름</Label>
                              <Input
                                value={keyword.name}
                                onChange={(e) => updateKeyword(index, { ...keyword, name: e.target.value })}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">설명 (30자 이내 권장)</Label>
                              <Input
                                value={keyword.description}
                                onChange={(e) => {
                                  if (e.target.value.length <= 30 || expertMode) {
                                    updateKeyword(index, { ...keyword, description: e.target.value });
                                  }
                                }}
                                className="mt-1"
                                maxLength={expertMode ? undefined : 30}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {keyword.description.length}{expertMode ? '' : '/30'} 글자
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="xs" onClick={() => setEditingKeywordIndex(null)}>
                                완료
                              </Button>
                              <Button variant="outline" size="xs" onClick={() => setEditingKeywordIndex(null)}>
                                취소
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{keyword.name}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {keyword.description}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setEditingKeywordIndex(index)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => removeKeyword(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {responseKeywords.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        아직 추가된 응답 방식 키워드가 없습니다.
                      </p>
                    )}
                  </div>
                </div>

                {/* 새 키워드 추가 */}
                {(maxKeywords === -1 || responseKeywords.length < maxKeywords) && (
                  <div>
                    <Label className="text-sm font-medium">새 키워드 추가</Label>
                    <div className="mt-3 space-y-3 p-4 border border-dashed rounded-lg">
                      <div>
                        <Label className="text-xs">키워드 이름</Label>
                        <Input
                          placeholder="예: 친근한, 전문적인, 창의적인..."
                          value={newKeyword.name}
                          onChange={(e) => setNewKeyword({ ...newKeyword, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">
                          세부 설명 {!expertMode && '(30자 이내 권장)'}
                        </Label>
                        <Input
                          placeholder="이 키워드가 어떤 응답 스타일을 나타내는지 설명..."
                          value={newKeyword.description}
                          onChange={(e) => {
                            if (e.target.value.length <= 30 || expertMode) {
                              setNewKeyword({ ...newKeyword, description: e.target.value });
                            }
                          }}
                          className="mt-1"
                          maxLength={expertMode ? undefined : 30}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {newKeyword.description.length}{expertMode ? '' : '/30'} 글자
                        </p>
                      </div>
                      <Button 
                        onClick={addKeyword}
                        disabled={!newKeyword.name.trim() || !newKeyword.description.trim()}
                        size="sm"
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        키워드 추가
                      </Button>
                    </div>
                  </div>
                )}

                {/* 제한 안내 */}
                {maxKeywords !== -1 && responseKeywords.length >= maxKeywords && (
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {expertMode ? 'Expert' : 'Advanced'} 모드에서는 최대 {maxKeywords}개의 키워드를 사용할 수 있습니다.
                    </p>
                  </div>
                )}

                {/* 추천 키워드 */}
                <div>
                  <Label className="text-sm font-medium">추천 키워드</Label>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { name: '친근한', desc: '따뜻하고 친근한 말투로 응답' },
                      { name: '전문적인', desc: '정확하고 전문적인 어조 사용' },
                      { name: '창의적인', desc: '독창적이고 혁신적인 아이디어 제시' },
                      { name: '논리적인', desc: '체계적이고 논리적인 설명' },
                      { name: '단계별', desc: '순서대로 단계별 안내' },
                      { name: '상세한', desc: '구체적이고 자세한 설명' },
                      { name: '간결한', desc: '핵심만 간단명료하게' },
                      { name: '격려하는', desc: '긍정적이고 동기부여적인 톤' }
                    ].map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          if ((maxKeywords === -1 || responseKeywords.length < maxKeywords) &&
                              !responseKeywords.some(k => k.name === preset.name)) {
                            setResponseKeywords([...responseKeywords, preset]);
                          }
                        }}
                        disabled={(maxKeywords !== -1 && responseKeywords.length >= maxKeywords) ||
                                 responseKeywords.some(k => k.name === preset.name)}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    응답 설정
                  </CardTitle>
                  <CardDescription>
                    AI의 응답 스타일과 창의성을 조절합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Temperature: {formData.temperature}</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      창의성과 일관성의 균형을 조절합니다
                    </p>
                    <Slider
                      value={[formData.temperature]}
                      onValueChange={(value) => setFormData({ ...formData, temperature: value[0] })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>보수적 (0.0)</span>
                      <span>창의적 (1.0)</span>
                    </div>
                  </div>

                  <div>
                    <Label>최대 토큰 수: {formData.maxOutputTokens}</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      응답의 최대 길이를 제한합니다
                    </p>
                    <Slider
                      value={[formData.maxOutputTokens]}
                      onValueChange={(value) => setFormData({ ...formData, maxOutputTokens: value[0] })}
                      max={4096}
                      min={256}
                      step={256}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>짧음 (256)</span>
                      <span>긺 (4096)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    안전 설정
                  </CardTitle>
                  <CardDescription>
                    유해 콘텐츠 차단 수준을 설정합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="safety">안전 수준</Label>
                    <Select 
                      value={formData.safetyLevel} 
                      onValueChange={(value) => setFormData({ ...formData, safetyLevel: value as keyof typeof safetyLevels })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(safetyLevels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Expert 모드 전용 탭 */}
          {expertMode && (
            <TabsContent value="expert" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    전문가 설정
                  </CardTitle>
                  <CardDescription>
                    Expert 모드에서만 사용할 수 있는 고급 Role 최적화 설정입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>컨텍스트 메모리 설정</Label>
                      <Select defaultValue="adaptive">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">최소 메모리</SelectItem>
                          <SelectItem value="balanced">균형</SelectItem>
                          <SelectItem value="adaptive">적응형 메모리</SelectItem>
                          <SelectItem value="maximum">최대 메모리</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Role이 과거 대화를 얼마나 기억할지 설정합니다.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label>응답 일관성 모드</Label>
                      <Select defaultValue="contextual">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="strict">엄격한 일관성</SelectItem>
                          <SelectItem value="contextual">맥락적 일관성</SelectItem>
                          <SelectItem value="adaptive">적응적 일관성</SelectItem>
                          <SelectItem value="creative">창의적 유연성</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Role이 일관성을 유지하는 방식을 설정합니다.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>고급 키워드 가중치</Label>
                    <div className="space-y-2">
                      {formData.keywordIds.map((keywordId) => {
                        const keyword = state.masterKeywords.find(k => k.id === keywordId);
                        if (!keyword) return null;
                        return (
                          <div key={keywordId} className="flex items-center gap-4 p-2 border rounded">
                            <span className="text-sm font-medium flex-1">{keyword.name}</span>
                            <div className="flex items-center gap-2 w-32">
                              <Slider
                                defaultValue={[50]}
                                max={100}
                                min={0}
                                step={5}
                              />
                              <span className="text-xs text-muted-foreground w-8">50%</span>
                            </div>
                          </div>
                        );
                      })}
                      {formData.keywordIds.length === 0 && (
                        <p className="text-sm text-muted-foreground">키워드 탭에서 키워드를 선택하면 여기서 가중치를 조정할 수 있습니다.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label>응답 검증 수준</Label>
                      <Select defaultValue="standard">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">최소 검증</SelectItem>
                          <SelectItem value="standard">표준 검증</SelectItem>
                          <SelectItem value="thorough">철저한 검증</SelectItem>
                          <SelectItem value="academic">학술적 검증</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label>전문 용어 사용 수준</Label>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="layman">일반인 수준</SelectItem>
                          <SelectItem value="balanced">균형잡힌</SelectItem>
                          <SelectItem value="professional">전문가 수준</SelectItem>
                          <SelectItem value="academic">학술적 수준</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-purple-800 dark:text-purple-200">Expert 기능 안내</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          이 설정들은 AI의 응답 품질과 전문성에 직접적인 영향을 미칩니다. 
                          각 프로젝트의 특성에 맞게 세밀하게 조정해보세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            <Save className="h-4 w-4 mr-2" />
            {roleToEdit ? '수정 완료' : 'Role 만들기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}