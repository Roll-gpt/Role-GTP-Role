// 개발 환경 유틸리티 함수들

/**
 * 개발 환경에서만 콘솔 로그를 출력합니다
 */
export const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEV]', ...args);
  }
};

/**
 * 개발 환경에서만 경고를 출력합니다
 */
export const devWarn = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[DEV WARNING]', ...args);
  }
};

/**
 * 개발 환경에서만 에러를 출력합니다
 */
export const devError = (...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('[DEV ERROR]', ...args);
  }
};

/**
 * API 호출 에러를 안전하게 처리합니다
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  errorMessage?: string
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error) {
    devWarn(errorMessage || 'API call failed, using fallback value:', error);
    return fallbackValue;
  }
};

/**
 * 서드파티 서비스가 활성화되어 있는지 확인합니다
 */
export const isServiceEnabled = (serviceName: string): boolean => {
  const envKey = `NEXT_PUBLIC_${serviceName.toUpperCase()}_ENABLED`;
  return process.env[envKey] === 'true';
};

/**
 * 개발 모드인지 확인합니다
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         process.env.NEXT_PUBLIC_DEV_MODE === 'true';
};

/**
 * 에러를 안전하게 무시합니다 (개발 환경에서만)
 */
export const ignoreDevErrors = (fn: () => void) => {
  if (isDevelopment()) {
    try {
      fn();
    } catch (error) {
      devWarn('Ignored development error:', error);
    }
  } else {
    fn();
  }
};