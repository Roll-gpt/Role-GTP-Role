// ConversationSettingsModal 컴포넌트 (간소화 버전)
const ConversationSettingsModal = ({ isOpen, onClose, chatId }) => {
    const { state, updateSettings } = useApp();
    const [activeTab, setActiveTab] = useState('conversation');
    
    // 모드별 기능 접근 권한 확인
    const userMode = state.userSettings.mode;
    const isStandard = userMode === 'standard';
    const isAdvanced = userMode === 'advanced';
    const isExpert = userMode === 'expert';

    // 변경사항 추적
    const [hasChanges, setHasChanges] = useState(false);
    const [applyScope, setApplyScope] = useState('chat');

    // 설정 상태들 (간소화)
    const [conversationReminder, setConversationReminder] = useState({
        enabled: true,
        interval: 10,
        style: 'bullets',
        compressThreshold: 3
    });

    const [roleReminder, setRoleReminder] = useState({
        enabled: true,
        interval: 10,
        strength: 'normal',
        customPrompt: ''
    });

    // ReadOnly 상태 카드 컴포넌트
    const ReadOnlyCard = ({ title, status, description, icon }) => (
        React.createElement(Card, { className: 'bg-muted/30' },
            React.createElement(CardContent, { className: 'p-4' },
                React.createElement('div', { className: 'flex items-center gap-3' },
                    React.createElement('div', { className: 'p-2 rounded-lg bg-primary/10' },
                        React.createElement('div', { className: 'w-4 h-4 text-primary' }, icon)
                    ),
                    React.createElement('div', { className: 'flex-1' },
                        React.createElement('div', { className: 'flex items-center gap-2' },
                            React.createElement('h4', { className: 'font-medium text-sm' }, title),
                            React.createElement(Badge, { variant: 'secondary', className: 'text-xs' }, status)
                        ),
                        React.createElement('p', { className: 'text-xs text-muted-foreground mt-1' }, description)
                    ),
                    React.createElement('div', { 
                        className: 'w-4 h-4 text-muted-foreground',
                        title: '읽기 전용 - 설정을 보려면 모드를 업그레이드하세요'
                    }, 'ℹ️')
                )
            )
        )
    );

    // 업그레이드 알림 컴포넌트
    const UpgradeNotice = ({ feature, requiredMode }) => (
        React.createElement(Card, { className: 'bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-purple-500/20' },
            React.createElement(CardContent, { className: 'p-4' },
                React.createElement('div', { className: 'flex items-start gap-3' },
                    React.createElement('div', { className: 'p-2 rounded-lg bg-purple-500/10' },
                        React.createElement('div', { className: 'w-4 h-4 text-purple-500' }, '⬆️')
                    ),
                    React.createElement('div', { className: 'flex-1' },
                        React.createElement('h4', { className: 'font-medium text-sm mb-1' }, `${requiredMode} 모드로 업그레이드`),
                        React.createElement('p', { className: 'text-sm text-muted-foreground mb-3' },
                            `${feature} 기능의 모든 옵션을 사용할 수 있습니다.`
                        ),
                        React.createElement(Button, { size: 'sm', variant: 'outline', className: 'text-xs' },
                            '업그레이드 방법 보기'
                        )
                    )
                )
            )
        )
    );

    // 설정 저장
    const handleSave = () => {
        console.log('Settings saved:', { conversationReminder, roleReminder, applyScope });
        setHasChanges(false);
        onClose();
    };

    const handleReset = () => {
        setConversationReminder({
            enabled: true,
            interval: 10,
            style: 'bullets',
            compressThreshold: 3
        });
        setRoleReminder({
            enabled: true,
            interval: 10,
            strength: 'normal',
            customPrompt: ''
        });
        setHasChanges(false);
    };

    if (!isOpen) return null;

    return React.createElement('div', { 
        className: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4',
        onClick: onClose
    },
        React.createElement('div', { 
            className: 'bg-background border border-border rounded-xl shadow-lg max-w-4xl w-full max-h-[85vh] overflow-hidden',
            onClick: (e) => e.stopPropagation()
        },
            // Header
            React.createElement('div', { className: 'flex items-center justify-between p-6 border-b border-border' },
                React.createElement('div', { className: 'flex items-center gap-3' },
                    React.createElement('div', { className: 'w-5 h-5' }, '⚙️'),
                    React.createElement('div', {},
                        React.createElement('div', { className: 'flex items-center gap-2' },
                            React.createElement('h2', { className: 'text-xl font-medium' }, '대화창 설정'),
                            hasChanges && React.createElement('div', { 
                                className: 'flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20' 
                            },
                                React.createElement('div', { className: 'w-2 h-2 rounded-full bg-orange-500' }),
                                React.createElement('span', { className: 'text-xs text-orange-600' }, '변경사항 있음')
                            )
                        ),
                        React.createElement('p', { className: 'text-sm text-muted-foreground mt-1' },
                            '현재 대화창의 리마인더, 서랍, API 설정을 관리합니다'
                        )
                    )
                ),
                React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement(Badge, { 
                        variant: userMode === 'expert' ? 'default' : userMode === 'advanced' ? 'secondary' : 'outline'
                    }, userMode.toUpperCase() + ' 모드'),
                    React.createElement(Button, { 
                        variant: 'ghost', 
                        size: 'icon', 
                        onClick: onClose, 
                        className: 'h-6 w-6' 
                    }, '✕')
                )
            ),

            // Expert 모드 우선순위 안내
            isExpert && React.createElement('div', { className: 'mx-6 mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800' },
                React.createElement('div', { className: 'flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1' },
                    React.createElement('div', { className: 'w-4 h-4' }, 'ℹ️'),
                    React.createElement('span', { className: 'text-sm font-medium' }, '처리 순서')
                ),
                React.createElement('p', { className: 'text-xs text-blue-600/80 dark:text-blue-400/80' },
                    'Role 리마인더 주입 → 사용자 프롬프트 → 모델 응답 → 대화 리마인더 요약 저장'
                )
            ),

            // Content (간소화된 탭 2개만)
            React.createElement('div', { className: 'p-6 overflow-y-auto max-h-[60vh]' },
                React.createElement('div', { className: 'space-y-6' },
                    // 대화 리마인더 섹션
                    React.createElement('div', { className: 'space-y-4' },
                        React.createElement('div', { className: 'flex items-center gap-2' },
                            React.createElement('div', { className: 'w-5 h-5 text-blue-500' }, '💬'),
                            React.createElement('h3', { className: 'font-medium' }, '대화 리마인더')
                        ),
                        
                        isStandard ? 
                            React.createElement(ReadOnlyCard, {
                                title: '대화 리마인더',
                                status: 'ON · 10턴',
                                description: '일정 주기마다 대화 맥락을 자동으로 압축하여 성능을 최적화합니다',
                                icon: '💬'
                            }) :
                            React.createElement('div', { className: 'space-y-4' },
                                React.createElement('div', { className: 'flex items-center justify-between' },
                                    React.createElement('div', { className: 'space-y-1' },
                                        React.createElement('label', { className: 'font-medium' }, '대화 리마인더 활성화'),
                                        React.createElement('p', { className: 'text-sm text-muted-foreground' },
                                            '일정 주기마다 대화 맥락을 압축하고 요약합니다'
                                        )
                                    ),
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: conversationReminder.enabled,
                                        onChange: (e) => {
                                            setConversationReminder(prev => ({ ...prev, enabled: e.target.checked }));
                                            setHasChanges(true);
                                        },
                                        className: 'w-5 h-5'
                                    })
                                ),

                                conversationReminder.enabled && React.createElement('div', { className: 'space-y-2' },
                                    React.createElement('div', { className: 'flex justify-between items-center' },
                                        React.createElement('label', {}, '압축 주기 (메시지 개수)'),
                                        React.createElement('span', { className: 'text-sm text-muted-foreground' }, 
                                            conversationReminder.interval + '개'
                                        )
                                    ),
                                    React.createElement('input', {
                                        type: 'range',
                                        min: isAdvanced ? 10 : 5,
                                        max: isAdvanced ? 30 : 50,
                                        step: isAdvanced ? 10 : 5,
                                        value: conversationReminder.interval,
                                        onChange: (e) => {
                                            setConversationReminder(prev => ({ ...prev, interval: parseInt(e.target.value) }));
                                            setHasChanges(true);
                                        },
                                        className: 'w-full'
                                    })
                                ),

                                !isExpert && React.createElement(UpgradeNotice, {
                                    feature: '대화 리마인더',
                                    requiredMode: 'Expert'
                                })
                            )
                    ),

                    // Role 리마인더 섹션
                    React.createElement('div', { className: 'space-y-4' },
                        React.createElement('div', { className: 'flex items-center gap-2' },
                            React.createElement('div', { className: 'w-5 h-5 text-purple-500' }, '👤'),
                            React.createElement('h3', { className: 'font-medium' }, 'Role 리마인더')
                        ),
                        
                        isStandard ? 
                            React.createElement(ReadOnlyCard, {
                                title: 'Role 리마인더',
                                status: 'ON · 기본 강도',
                                description: '선택한 Role을 주기적으로 AI에 주입하여 대화 일관성을 유지합니다',
                                icon: '👤'
                            }) :
                            React.createElement('div', { className: 'space-y-4' },
                                React.createElement('div', { className: 'flex items-center justify-between' },
                                    React.createElement('div', { className: 'space-y-1' },
                                        React.createElement('label', { className: 'font-medium' }, 'Role 리마인더 활성화'),
                                        React.createElement('p', { className: 'text-sm text-muted-foreground' },
                                            '선택한 Role을 주기적으로 AI에 주입하여 일관성을 유지합니다'
                                        )
                                    ),
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: roleReminder.enabled,
                                        onChange: (e) => {
                                            setRoleReminder(prev => ({ ...prev, enabled: e.target.checked }));
                                            setHasChanges(true);
                                        },
                                        className: 'w-5 h-5'
                                    })
                                ),

                                roleReminder.enabled && React.createElement('div', { className: 'space-y-2' },
                                    React.createElement('div', { className: 'flex justify-between items-center' },
                                        React.createElement('label', {}, '리마인더 주기 (메시지 개수)'),
                                        React.createElement('span', { className: 'text-sm text-muted-foreground' }, 
                                            roleReminder.interval + '개'
                                        )
                                    ),
                                    React.createElement('input', {
                                        type: 'range',
                                        min: isAdvanced ? 10 : 5,
                                        max: isAdvanced ? 30 : 20,
                                        step: isAdvanced ? 10 : 5,
                                        value: roleReminder.interval,
                                        onChange: (e) => {
                                            setRoleReminder(prev => ({ ...prev, interval: parseInt(e.target.value) }));
                                            setHasChanges(true);
                                        },
                                        className: 'w-full'
                                    })
                                ),

                                !isExpert && React.createElement(UpgradeNotice, {
                                    feature: 'Role 리마인더',
                                    requiredMode: 'Expert'
                                })
                            )
                    )
                )
            ),

            // Footer
            React.createElement('div', { className: 'p-6 border-t border-border space-y-3' },
                // 적용 범위 선택
                React.createElement('div', { className: 'flex items-center justify-center gap-4' },
                    React.createElement('div', { className: 'flex items-center space-x-2' },
                        React.createElement('input', {
                            type: 'radio',
                            id: 'apply-chat',
                            name: 'apply-scope',
                            value: 'chat',
                            checked: applyScope === 'chat',
                            onChange: (e) => setApplyScope(e.target.value),
                            className: 'w-4 h-4'
                        }),
                        React.createElement('label', { htmlFor: 'apply-chat', className: 'text-sm' },
                            '이 채팅에만 적용'
                        )
                    ),
                    React.createElement('div', { className: 'flex items-center space-x-2' },
                        React.createElement('input', {
                            type: 'radio',
                            id: 'apply-default',
                            name: 'apply-scope',
                            value: 'default',
                            checked: applyScope === 'default',
                            onChange: (e) => setApplyScope(e.target.value),
                            className: 'w-4 h-4'
                        }),
                        React.createElement('label', { htmlFor: 'apply-default', className: 'text-sm' },
                            '내 기본값으로 저장'
                        )
                    )
                ),

                // 버튼들
                React.createElement('div', { className: 'flex justify-between gap-3' },
                    React.createElement(Button, { variant: 'outline', onClick: handleReset },
                        '기본값으로 리셋'
                    ),
                    React.createElement('div', { className: 'flex gap-2' },
                        React.createElement(Button, { variant: 'outline', onClick: onClose },
                            '취소'
                        ),
                        React.createElement(Button, { onClick: handleSave, disabled: !hasChanges },
                            applyScope === 'chat' ? '채팅에 적용' : '기본값 저장'
                        )
                    )
                )
            )
        )
    );
};

window.ConversationSettingsModal = ConversationSettingsModal;