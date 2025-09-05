// WelcomeCard 컴포넌트 (간소화 버전)
const WelcomeCard = ({ onRoleSelect, onStartChat }) => {
    const { state } = useApp();
    const [currentRole, setCurrentRole] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // 모드별 기능 확인
    const userMode = state.userSettings.mode;
    const isStandard = userMode === 'standard';
    const isAdvanced = userMode === 'advanced';
    const isExpert = userMode === 'expert';

    // 추천/인기 Role들만 필터링
    const availableRoles = state.roles.filter(role => 
        role.category === 'recommended' || 
        role.category === 'popular'
    );

    // 랜덤 Role 선택
    const getRandomRole = () => {
        if (availableRoles.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * availableRoles.length);
        return availableRoles[randomIndex];
    };

    // 컴포넌트 마운트 시 랜덤 Role 설정
    useEffect(() => {
        const randomRole = getRandomRole();
        setCurrentRole(randomRole);
    }, []);

    // 새로운 랜덤 Role로 변경
    const handleRefresh = () => {
        setIsAnimating(true);
        setTimeout(() => {
            const newRole = getRandomRole();
            setCurrentRole(newRole);
            setIsAnimating(false);
        }, 300);
    };

    // Role 내보내기
    const handleExportRole = () => {
        if (!currentRole) return;

        const roleData = {
            name: currentRole.name,
            description: currentRole.description,
            prompt: currentRole.prompt,
            category: currentRole.category,
            exportedAt: new Date().toISOString(),
            exportedFrom: 'Role GPT Welcomecard'
        };

        console.log('Role exported:', roleData);
        alert(`"${currentRole.name}" Role이 내보내기 되었습니다.`);
    };

    // 대화 시작
    const handleStartChat = () => {
        if (!currentRole) return;
        if (onStartChat) onStartChat(currentRole);
    };

    // Role 선택 (갤러리로 이동)
    const handleSelectRole = () => {
        if (!currentRole) return;
        if (onRoleSelect) onRoleSelect(currentRole);
    };

    if (!currentRole) {
        return React.createElement(Card, { className: 'w-full max-w-md mx-auto' },
            React.createElement(CardContent, { className: 'p-6 text-center' },
                React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto' }),
                React.createElement('p', { className: 'text-sm text-muted-foreground mt-2' }, '랜덤 Role 로딩 중...')
            )
        );
    }

    // 카테고리별 색상
    const getCategoryColor = (category) => {
        const colors = {
            'recommended': 'bg-purple-500',
            'popular': 'bg-blue-500',
            'lifestyle': 'bg-green-500',
            'creativity': 'bg-yellow-500',
            'productivity': 'bg-indigo-500',
            'education': 'bg-orange-500',
            'expert': 'bg-red-500'
        };
        return colors[category] || 'bg-gray-500';
    };

    const getCategoryName = (category) => {
        const names = {
            'recommended': '추천',
            'popular': '인기',
            'lifestyle': '라이프스타일',
            'creativity': '창의성',
            'productivity': '생산성',
            'education': '교육',
            'expert': '전문가'
        };
        return names[category] || category;
    };

    return React.createElement(Card, { 
        className: 'w-full max-w-md mx-auto bg-gradient-to-br from-background to-muted/30 border shadow-lg' 
    },
        // Header
        React.createElement(CardHeader, { className: 'pb-3' },
            React.createElement('div', { className: 'flex items-center justify-between' },
                React.createElement('div', { className: 'flex items-center gap-2' },
                    React.createElement('div', { 
                        className: 'w-5 h-5 text-primary',
                        children: '✨'
                    }),
                    React.createElement(CardTitle, { className: 'text-lg' }, '오늘의 추천 Role')
                ),
                React.createElement(Button, {
                    variant: 'ghost',
                    size: 'icon',
                    onClick: handleRefresh,
                    className: 'h-8 w-8 hover:bg-background/50',
                    disabled: isAnimating,
                    children: '🔄'
                })
            )
        ),

        // Content
        React.createElement(CardContent, { className: 'space-y-4' },
            // Role 정보
            React.createElement('div', { 
                className: `transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}` 
            },
                React.createElement('div', { className: 'flex items-start gap-3 mb-3' },
                    React.createElement('div', { 
                        className: `w-10 h-10 ${getCategoryColor(currentRole.category)} rounded-lg flex items-center justify-center flex-shrink-0` 
                    },
                        React.createElement('span', { className: 'text-white font-bold text-sm' },
                            currentRole.name.charAt(0).toUpperCase()
                        )
                    ),
                    React.createElement('div', { className: 'flex-1' },
                        React.createElement('h3', { className: 'font-semibold text-base mb-1' }, currentRole.name),
                        React.createElement(Badge, { variant: 'secondary', className: 'text-xs' },
                            getCategoryName(currentRole.category)
                        )
                    )
                ),
                React.createElement('p', { className: 'text-sm text-muted-foreground leading-relaxed mb-4' },
                    currentRole.description
                )
            ),

            // 액션 버튼들
            React.createElement('div', { className: 'space-y-2' },
                // Standard: 대화하기만
                isStandard && React.createElement(Button, {
                    onClick: handleStartChat,
                    className: 'w-full',
                    size: 'lg',
                    children: ['💬 ', '대화하기']
                }),

                // Advanced: 대화하기 + 내보내기
                isAdvanced && React.createElement('div', { className: 'flex gap-2' },
                    React.createElement(Button, {
                        onClick: handleStartChat,
                        className: 'flex-1',
                        size: 'lg',
                        children: ['💬 ', '대화하기']
                    }),
                    React.createElement(Button, {
                        onClick: handleExportRole,
                        variant: 'outline',
                        size: 'lg',
                        children: '📥'
                    })
                ),

                // Expert: 전체 기능
                isExpert && React.createElement('div', { className: 'space-y-2' },
                    React.createElement('div', { className: 'flex gap-2' },
                        React.createElement(Button, {
                            onClick: handleStartChat,
                            className: 'flex-1',
                            size: 'lg',
                            children: ['💬 ', '대화하기']
                        }),
                        React.createElement(Button, {
                            onClick: handleExportRole,
                            variant: 'outline',
                            size: 'lg',
                            children: '📥'
                        })
                    ),
                    React.createElement(Button, {
                        onClick: handleSelectRole,
                        variant: 'secondary',
                        className: 'w-full',
                        size: 'sm',
                        children: 'Role 갤러리에서 보기'
                    })
                ),

                // 모드별 기능 안내
                isStandard && React.createElement('div', { className: 'text-center' },
                    React.createElement('p', { className: 'text-xs text-muted-foreground' },
                        'Advanced 모드에서 Role 내보내기 기능을 이용하세요'
                    )
                )
            )
        )
    );
};

window.WelcomeCard = WelcomeCard;