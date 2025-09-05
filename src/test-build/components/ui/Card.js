// Card 컴포넌트들
const Card = ({ className = '', children, ...props }) => {
    return React.createElement('div', {
        className: `rounded-lg border border-border bg-card text-card-foreground shadow-sm ${className}`,
        ...props
    }, children);
};

const CardHeader = ({ className = '', children, ...props }) => {
    return React.createElement('div', {
        className: `flex flex-col space-y-1.5 p-6 ${className}`,
        ...props
    }, children);
};

const CardTitle = ({ className = '', children, ...props }) => {
    return React.createElement('h3', {
        className: `text-2xl font-semibold leading-none tracking-tight ${className}`,
        ...props
    }, children);
};

const CardDescription = ({ className = '', children, ...props }) => {
    return React.createElement('p', {
        className: `text-sm text-muted-foreground ${className}`,
        ...props
    }, children);
};

const CardContent = ({ className = '', children, ...props }) => {
    return React.createElement('div', {
        className: `p-6 pt-0 ${className}`,
        ...props
    }, children);
};

const CardFooter = ({ className = '', children, ...props }) => {
    return React.createElement('div', {
        className: `flex items-center p-6 pt-0 ${className}`,
        ...props
    }, children);
};

// 전역으로 등록
window.Card = Card;
window.CardHeader = CardHeader;
window.CardTitle = CardTitle;
window.CardDescription = CardDescription;
window.CardContent = CardContent;
window.CardFooter = CardFooter;