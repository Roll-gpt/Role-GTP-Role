// 테스트용 메인 앱 컴포넌트
const TestApp = () => {
    const { state, updateSettings } = useApp();
    const [showWelcomeCard, setShowWelcomeCard] = useState(true);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const handleRoleSelect = (role) => {
        console.log('Role selected:', role);
        alert(`Role "${role.name}" 선택됨!`);
    };

    const handleStartChat = (role) => {
        console.log('Start chat with role:', role);
        alert(`"${role.name}"와 대화를 시작합니다!`);
        setShowWelcomeCard(false);
    };

    const handleModeChange = (mode) => {
        updateSettings({ mode });
        console.log('Mode changed to:', mode);
    };

    return React.createElement('div', { 
        className: 'min-h-screen bg-background text-foreground p-6' 
    },
        // Header
        React.createElement('div', { className: 'max-w-4xl mx-auto mb-8' },
            React.createElement('div', { className: 'flex items-center justify-between mb-6' },
                React.createElement('h1', { className: 'text-3xl font-bold' }, 'Role GPT - Test Build'),
                React.createElement('div', { className: 'flex items-center gap-4' },
                    React.createElement(Badge, { 
                        variant: state.userSettings.mode === 'expert' ? 'default' : 
                                state.userSettings.mode === 'advanced' ? 'secondary' : 'outline'
                    }, state.userSettings.mode.toUpperCase() + ' 모드'),
                    React.createElement(Button, { 
                        variant: 'outline',
                        onClick: () => setShowSettingsModal(true)
                    }, '⚙️ 대화 설정')
                )
            ),

            // 모드 전환 버튼들
            React.createElement('div', { className: 'flex gap-2 mb-8' },
                ['standard', 'advanced', 'expert'].map(mode =>
                    React.createElement(Button, {
                        key: mode,
                        variant: state.userSettings.mode === mode ? 'default' : 'outline',
                        size: 'sm',
                        onClick: () => handleModeChange(mode)
                    }, mode.toUpperCase())
                )
            ),

            React.createElement('p', { className: 'text-muted-foreground mb-8' },
                'Google AI Studio 연결 테스트용 빌드입니다. 모드별 기능 차이를 확인해보세요.'
            )
        ),

        // Main Content
        React.createElement('div', { className: 'max-w-4xl mx-auto space-y-8' },
            // Welcome Card (조건부 표시)
            showWelcomeCard && React.createElement('div', { className: 'flex justify-center' },
                React.createElement(WelcomeCard, {
                    onRoleSelect: handleRoleSelect,
                    onStartChat: handleStartChat
                })
            ),

            // 기능 테스트 카드들
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
                // WelcomeCard 토글
                React.createElement(Card, {},
                    React.createElement(CardHeader, {},
                        React.createElement(CardTitle, { className: 'text-lg' }, 'WelcomeCard 테스트')
                    ),
                    React.createElement(CardContent, {},
                        React.createElement('p', { className: 'text-sm text-muted-foreground mb-4' },
                            '랜덤 Role 카드를 표시하고 모드별 기능 차이를 보여줍니다.'
                        ),
                        React.createElement(Button, { 
                            onClick: () => setShowWelcomeCard(!showWelcomeCard),
                            className: 'w-full'
                        }, showWelcomeCard ? 'WelcomeCard 숨기기' : 'WelcomeCard 보이기')
                    )
                ),

                // 대화 설정 모달
                React.createElement(Card, {},
                    React.createElement(CardHeader, {},
                        React.createElement(CardTitle, { className: 'text-lg' }, '대화 설정 모달')
                    ),
                    React.createElement(CardContent, {},
                        React.createElement('p', { className: 'text-sm text-muted-foreground mb-4' },
                            '모드별로 다른 설정 옵션을 제공하는 대화창 설정 모달입니다.'
                        ),
                        React.createElement(Button, { 
                            onClick: () => setShowSettingsModal(true),
                            className: 'w-full'
                        }, '대화 설정 열기')
                    )
                ),

                // 현재 상태 정보
                React.createElement(Card, {},
                    React.createElement(CardHeader, {},
                        React.createElement(CardTitle, { className: 'text-lg' }, '현재 상태')
                    ),
                    React.createElement(CardContent, {},
                        React.createElement('div', { className: 'space-y-2 text-sm' },
                            React.createElement('div', {},
                                React.createElement('strong', {}, '모드: '),
                                React.createElement('span', { className: 'text-muted-foreground' }, state.userSettings.mode)
                            ),
                            React.createElement('div', {},
                                React.createElement('strong', {}, 'Role 개수: '),
                                React.createElement('span', { className: 'text-muted-foreground' }, state.roles.length)
                            ),
                            React.createElement('div', {},
                                React.createElement('strong', {}, '대화 개수: '),
                                React.createElement('span', { className: 'text-muted-foreground' }, state.conversations.length)
                            )
                        )
                    )
                ),

                // Google AI Studio 연결 테스트
                React.createElement(Card, {},
                    React.createElement(CardHeader, {},
                        React.createElement(CardTitle, { className: 'text-lg' }, 'AI 연결 테스트')
                    ),
                    React.createElement(CardContent, {},
                        React.createElement('p', { className: 'text-sm text-muted-foreground mb-4' },
                            'Google AI Studio와의 연결을 테스트할 수 있습니다.'
                        ),
                        React.createElement(Button, { 
                            onClick: () => alert('Google AI Studio 연결 테스트 준비 완료!'),
                            className: 'w-full',
                            variant: 'outline'
                        }, '🤖 AI 연결 테스트')
                    )
                )
            )
        ),

        // 대화 설정 모달
        React.createElement(ConversationSettingsModal, {
            isOpen: showSettingsModal,
            onClose: () => setShowSettingsModal(false),
            chatId: 'test-chat-1'
        })
    );
};

window.TestApp = TestApp;