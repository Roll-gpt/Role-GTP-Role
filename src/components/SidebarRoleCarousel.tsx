import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { PLAYGROUND_ROLES } from '../src/constants';

interface SidebarRoleCarouselProps {
  onRoleSelect: (role: any) => void;
  isExpanded: boolean;
}

export function SidebarRoleCarousel({ onRoleSelect, isExpanded }: SidebarRoleCarouselProps) {
  // 모든 상태를 최상단에 선언
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragProgress, setDragProgress] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const [isInertiaScrolling, setIsInertiaScrolling] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();
  const inertiaRef = useRef<number>();

  // 표시할 Role 수 계산 - 사이드바에서는 더 작게
  const itemsPerView = isExpanded ? 3 : 1;
  // 12개 Role을 3개씩 보여주면 4페이지 (0, 1, 2, 3)
  const totalPages = Math.ceil(PLAYGROUND_ROLES.length / itemsPerView);
  const maxIndex = Math.max(0, totalPages - 1);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  // 자동 재생 로직
  useEffect(() => {
    if (isAutoPlaying && totalPages > 1 && isExpanded && !isDragging && !isInertiaScrolling) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
      }, 7000); // 7초로 적당한 속도 조정
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, maxIndex, totalPages, isExpanded, isDragging, isInertiaScrolling]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (inertiaRef.current) {
        cancelAnimationFrame(inertiaRef.current);
      }
    };
  }, []);

  const handleRoleClick = (role: typeof PLAYGROUND_ROLES[0]) => {
    if (!isDragging) {
      setIsAutoPlaying(false);
      onRoleSelect({
        id: role.id,
        name: role.name,
        description: role.description,
        prompt: role.prompt,
        category: role.category,
        avatar: role.avatar,
        keywordIds: [],
        temperature: role.temperature || 0.8,
        maxOutputTokens: role.maxOutputTokens || 2048,
        safetyLevel: role.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE' as const
      });
    }
  };

  // 관성 스크롤 구현
  const startInertiaScroll = (initialVelocity: number) => {
    if (Math.abs(initialVelocity) < 0.5) return;
    
    setIsInertiaScrolling(true);
    let currentVel = initialVelocity;
    const friction = 0.95;
    let currentIdx = currentIndex;
    
    const inertiaStep = () => {
      currentVel *= friction;
      
      if (Math.abs(currentVel) > 2) {
        if (currentVel > 0 && currentIdx > 0) {
          currentIdx--;
          setCurrentIndex(currentIdx);
          currentVel *= 0.7;
        } else if (currentVel < 0 && currentIdx < maxIndex) {
          currentIdx++;
          setCurrentIndex(currentIdx);
          currentVel *= 0.7;
        }
      }
      
      if (Math.abs(currentVel) > 0.1) {
        inertiaRef.current = requestAnimationFrame(inertiaStep);
      } else {
        setIsInertiaScrolling(false);
      }
    };
    
    inertiaRef.current = requestAnimationFrame(inertiaStep);
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isInertiaScrolling) return;
    
    setIsDragging(false);
    setDragStart(e.clientX);
    setLastMoveTime(Date.now());
    setLastMoveX(e.clientX);
    setIsAutoPlaying(false);
    setDragProgress(0);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart === 0) return;
    setIsDragging(true);
    const offset = e.clientX - dragStart;
    setDragOffset(offset);
    
    const progress = Math.max(-1, Math.min(1, offset / 100));
    setDragProgress(progress);
    
    // 속도 계산
    const now = Date.now();
    const timeDelta = now - lastMoveTime;
    if (timeDelta > 0) {
      const vel = (e.clientX - lastMoveX) / timeDelta * 10;
      setVelocity(vel);
      setLastMoveTime(now);
      setLastMoveX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (dragStart === 0) return;
    
    const threshold = 50;
    if (Math.abs(dragOffset) > threshold / 2) {
      if (dragOffset > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    
    // 관성 스크롤 시작
    if (Math.abs(velocity) > 1) {
      startInertiaScroll(velocity);
    }
    
    setDragStart(0);
    setDragOffset(0);
    setDragProgress(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInertiaScrolling) return;
    
    setIsDragging(false);
    setDragStart(e.touches[0].clientX);
    setLastMoveTime(Date.now());
    setLastMoveX(e.touches[0].clientX);
    setIsAutoPlaying(false);
    setDragProgress(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStart === 0) return;
    setIsDragging(true);
    const offset = e.touches[0].clientX - dragStart;
    setDragOffset(offset);
    
    const progress = Math.max(-1, Math.min(1, offset / 100));
    setDragProgress(progress);
    
    // 속도 계산
    const now = Date.now();
    const timeDelta = now - lastMoveTime;
    if (timeDelta > 0) {
      const vel = (e.touches[0].clientX - lastMoveX) / timeDelta * 10;
      setVelocity(vel);
      setLastMoveTime(now);
      setLastMoveX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (dragStart === 0) return;
    
    const threshold = 50;
    if (Math.abs(dragOffset) > threshold / 2) {
      if (dragOffset > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    
    // 관성 스크롤 시작
    if (Math.abs(velocity) > 1) {
      startInertiaScroll(velocity);
    }
    
    setDragStart(0);
    setDragOffset(0);
    setDragProgress(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  if (!isExpanded) {
    // 축소된 상태에서는 아이콘만 표시
    const currentRole = PLAYGROUND_ROLES[currentIndex % PLAYGROUND_ROLES.length];
    return (
      <div className="px-2 py-2">
        <button
          onClick={() => handleRoleClick(currentRole)}
          className="w-full p-2 rounded-lg hover:bg-accent/50 transition-colors group"
          title={currentRole.name}
        >
          <div className="flex items-center justify-center">
            <div className="text-2xl group-hover:scale-110 transition-transform">
              {currentRole.avatar}
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">🎭 추천</span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-5 h-5"
              onClick={handleNext}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* 드래그 진행률 인디케이터 */}
      {isDragging && Math.abs(dragProgress) > 0.1 && (
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center mb-1">
          <div className="bg-primary/20 backdrop-blur-sm rounded text-[10px] px-2 py-0.5 text-primary">
            {dragProgress > 0 ? '←' : '→'} {Math.round(Math.abs(dragProgress) * 100)}%
          </div>
        </div>
      )}

      {/* 캐러셀 컨테이너 */}
      <div 
        className="overflow-hidden rounded-lg cursor-grab active:cursor-grabbing select-none relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`flex transition-transform ${
            isDragging || isInertiaScrolling ? 'duration-0' : 'duration-300'
          } ease-out`}
          style={{
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
            width: `${totalPages * 100}%`,
            opacity: isDragging ? 0.9 : 1
          }}
        >
          {/* 페이지별로 Role 그룹핑 */}
          {Array.from({ length: totalPages }, (_, pageIndex) => (
            <div
              key={pageIndex}
              className="flex-shrink-0 flex gap-1"
              style={{ width: `${100 / totalPages}%` }}
            >
              {PLAYGROUND_ROLES.slice(pageIndex * itemsPerView, (pageIndex + 1) * itemsPerView).map((role) => (
                <div
                  key={role.id}
                  className="flex-1 px-1"
                >
                  <button
                    onClick={() => handleRoleClick(role)}
                    className="w-full p-2 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex flex-col items-center text-center space-y-1">
                      {/* 아바타 */}
                      <div className="text-lg group-hover:scale-110 transition-transform">
                        {role.avatar}
                      </div>
                      
                      {/* 이름 */}
                      <div className="text-xs font-medium text-foreground truncate w-full">
                        {role.name.replace(/^[^\s]+\s/, '')} {/* 이모지 제거 */}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 향상된 인디케이터 - 정확히 4개 페이지 표시 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setIsAutoPlaying(false);
              }}
              className={`rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'w-3 h-1 bg-primary shadow-sm' 
                  : 'w-1 h-1 bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}