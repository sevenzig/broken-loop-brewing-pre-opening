interface PreloadManagerProps {
  children: React.ReactNode;
}

export const PreloadManager: React.FC<PreloadManagerProps> = ({ children }) => {
  // For now, we'll keep this simple and just return children
  // The dynamic imports were causing conflicts with static imports
  // We'll implement a different optimization strategy
  
  return <>{children}</>;
};

export default PreloadManager;
