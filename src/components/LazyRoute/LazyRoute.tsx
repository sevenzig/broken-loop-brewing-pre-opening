import React, { Suspense, lazy } from 'react';
import type { ComponentType } from 'react';
import { RouteLoader } from '../RouteLoader/RouteLoader';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

interface LazyRouteProps {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  importFn, 
  fallback = <RouteLoader />,
  errorFallback
}) => {
  const LazyComponent = lazy(importFn);

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRoute;
