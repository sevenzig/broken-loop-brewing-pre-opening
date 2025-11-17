import type { 
  ContentItem, 
  ContentConflictResolution, 
  ConflictResolutionStrategy,
  ConflictAnalysis
} from '../types/ContentManager';

export class ConflictResolutionService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.initialized = true;
    console.log('ConflictResolutionService initialized successfully');
  }

  async resolveConflict(
    existingContent: ContentItem,
    incomingContent: ContentItem,
    strategy: ConflictResolutionStrategy
  ): Promise<ContentConflictResolution> {
    await this.initialize();
    
    const analysis = this.analyzeConflict(existingContent, incomingContent);
    
    switch (strategy.type) {
      case 'overwrite':
        return this.handleOverwrite(existingContent, incomingContent, analysis);
      
      case 'merge':
        return this.handleMerge(existingContent, incomingContent, strategy, analysis);
      
      case 'reject':
        return this.handleReject(existingContent, incomingContent, analysis);
      
      case 'version':
        return this.handleVersion(existingContent, incomingContent, strategy, analysis);
      
      case 'interactive':
        return this.handleInteractive(existingContent, incomingContent, strategy, analysis);
      
      default:
        throw new Error(`Unknown conflict resolution strategy: ${(strategy as any).type}`);
    }
  }

  private analyzeConflict(existing: ContentItem, incoming: ContentItem): ConflictAnalysis {
    const metadataConflicts: string[] = [];
    const contentConflict = existing.content !== incoming.content;
    
    // Analyze metadata conflicts
    const allKeys = new Set([
      ...Object.keys(existing.metadata),
      ...Object.keys(incoming.metadata)
    ]);
    
    for (const key of allKeys) {
      const existingValue = existing.metadata[key];
      const incomingValue = incoming.metadata[key];
      
      if (existingValue !== incomingValue) {
        metadataConflicts.push(key);
      }
    }

    // Determine conflict severity
    const severity = this.determineConflictSeverity(existing, incoming, metadataConflicts, contentConflict);
    
    // Check if auto-resolvable
    const autoResolvable = this.isAutoResolvable(existing, incoming, metadataConflicts, contentConflict);

    return {
      hasConflict: metadataConflicts.length > 0 || contentConflict,
      metadataConflicts,
      contentConflict,
      severity,
      autoResolvable,
      existingVersion: existing.version,
      incomingVersion: incoming.version,
      existingModified: existing.lastModified,
      incomingModified: incoming.lastModified
    };
  }

  private determineConflictSeverity(
    existing: ContentItem, 
    incoming: ContentItem,
    metadataConflicts: string[],
    contentConflict: boolean
  ): 'low' | 'medium' | 'high' {
    // High severity: Core identification fields changed
    const coreFields = ['name', 'slug', 'id', 'type'];
    const hasCoreConflicts = metadataConflicts.some(field => coreFields.includes(field));
    
    if (hasCoreConflicts) {
      return 'high';
    }

    // Medium severity: Content or important metadata changed
    const importantFields = ['status', 'price', 'date', 'abv', 'category'];
    const hasImportantConflicts = metadataConflicts.some(field => importantFields.includes(field));
    
    if (contentConflict || hasImportantConflicts) {
      return 'medium';
    }

    // Low severity: Only minor metadata changed
    return 'low';
  }

  private isAutoResolvable(
    existing: ContentItem,
    incoming: ContentItem,
    metadataConflicts: string[],
    contentConflict: boolean
  ): boolean {
    // Can auto-resolve if only timestamp fields changed
    const timestampFields = ['created_at', 'updated_at', 'lastModified'];
    const nonTimestampConflicts = metadataConflicts.filter(field => !timestampFields.includes(field));
    
    return nonTimestampConflicts.length === 0 && !contentConflict;
  }

  private handleOverwrite(
    existing: ContentItem,
    incoming: ContentItem,
    analysis: ConflictAnalysis
  ): ContentConflictResolution {
    return {
      action: 'overwrite',
      mergedContent: incoming,
      reason: 'Overwrite strategy selected',
      conflictAnalysis: analysis
    };
  }

  private handleMerge(
    existing: ContentItem,
    incoming: ContentItem,
    strategy: ConflictResolutionStrategy,
    analysis: ConflictAnalysis
  ): ContentConflictResolution {
    if (analysis.severity === 'high' && !strategy.allowHighSeverityMerge) {
      return {
        action: 'reject',
        reason: 'High severity conflicts cannot be auto-merged',
        conflictAnalysis: analysis
      };
    }

    const mergedContent: ContentItem = {
      ...existing,
      ...incoming,
      metadata: this.mergeMetadata(existing.metadata, incoming.metadata, strategy.mergeRules || {}),
      content: this.mergeContent(existing.content, incoming.content, strategy.contentMergeStrategy || 'incoming'),
      lastModified: new Date().toISOString(),
      version: this.generateMergedVersion(existing.version, incoming.version)
    };

    return {
      action: 'merge',
      mergedContent,
      reason: 'Contents merged successfully',
      conflictAnalysis: analysis
    };
  }

  private handleReject(
    existing: ContentItem,
    incoming: ContentItem,
    analysis: ConflictAnalysis
  ): ContentConflictResolution {
    return {
      action: 'reject',
      reason: 'Conflict resolution strategy set to reject',
      conflictAnalysis: analysis
    };
  }

  private handleVersion(
    existing: ContentItem,
    incoming: ContentItem,
    strategy: ConflictResolutionStrategy,
    analysis: ConflictAnalysis
  ): ContentConflictResolution {
    if (analysis.severity === 'high') {
      return {
        action: 'reject',
        reason: 'High severity conflicts require manual resolution',
        conflictAnalysis: analysis
      };
    }

    // For version strategy, we create a new version of the content
    const versionedContent: ContentItem = {
      ...incoming,
      id: `${incoming.id}-v${Date.now()}`,
      metadata: {
        ...incoming.metadata,
        original_id: existing.id,
        version_of: existing.id,
        version_created_at: new Date().toISOString()
      },
      version: this.generateVersionedId()
    };

    return {
      action: 'version',
      mergedContent: versionedContent,
      reason: 'Created new version to avoid conflict',
      conflictAnalysis: analysis
    };
  }

  private handleInteractive(
    existing: ContentItem,
    incoming: ContentItem,
    strategy: ConflictResolutionStrategy,
    analysis: ConflictAnalysis
  ): ContentConflictResolution {
    // In a real implementation, this would present conflicts to the user
    // For now, we'll fall back to merge or reject based on severity
    if (analysis.severity === 'high') {
      return {
        action: 'reject',
        reason: 'Interactive resolution required for high severity conflicts',
        conflictAnalysis: analysis,
        requiresInteraction: true
      };
    }

    return this.handleMerge(existing, incoming, { type: 'merge' }, analysis);
  }

  private mergeMetadata(
    existingMeta: Record<string, any>,
    incomingMeta: Record<string, any>,
    mergeRules: Record<string, 'existing' | 'incoming' | 'merge' | 'both'>
  ): Record<string, any> {
    const merged = { ...existingMeta };
    
    for (const [key, value] of Object.entries(incomingMeta)) {
      const rule = mergeRules[key];
      
      switch (rule) {
        case 'existing':
          // Keep existing value
          break;
        case 'incoming':
          merged[key] = value;
          break;
        case 'merge':
          merged[key] = this.mergeValues(existingMeta[key], value);
          break;
        case 'both':
          merged[key] = [existingMeta[key], value].filter(v => v !== undefined);
          break;
        default:
          // Default: prefer incoming for most fields, existing for timestamps
          if (key.includes('created_at')) {
            // Keep existing creation time
          } else {
            merged[key] = value;
          }
      }
    }
    
    // Always update the modification timestamp
    merged.updated_at = new Date().toISOString();
    
    return merged;
  }

  private mergeContent(
    existingContent: string,
    incomingContent: string,
    strategy: 'existing' | 'incoming' | 'merge' | 'append'
  ): string {
    switch (strategy) {
      case 'existing':
        return existingContent;
      case 'incoming':
        return incomingContent;
      case 'merge':
        return this.smartMergeContent(existingContent, incomingContent);
      case 'append':
        return `${existingContent}\n\n---\n\n${incomingContent}`;
      default:
        return incomingContent;
    }
  }

  private smartMergeContent(existing: string, incoming: string): string {
    // Simple content merging - in a real implementation, you might use
    // more sophisticated diff/merge algorithms
    
    const existingLines = existing.split('\n');
    const incomingLines = incoming.split('\n');
    
    // If one is empty, use the other
    if (!existing.trim()) return incoming;
    if (!incoming.trim()) return existing;
    
    // If they're similar (> 80% same lines), merge by sections
    const similarity = this.calculateSimilarity(existingLines, incomingLines);
    
    if (similarity > 0.8) {
      return this.mergeSimilarContent(existingLines, incomingLines);
    }
    
    // Otherwise, append with separator
    return `${existing}\n\n---\n\n${incoming}`;
  }

  private mergeSimilarContent(existingLines: string[], incomingLines: string[]): string {
    const result: string[] = [];
    const maxLength = Math.max(existingLines.length, incomingLines.length);
    
    for (let i = 0; i < maxLength; i++) {
      const existingLine = existingLines[i] || '';
      const incomingLine = incomingLines[i] || '';
      
      if (existingLine === incomingLine) {
        result.push(existingLine);
      } else if (!existingLine) {
        result.push(incomingLine);
      } else if (!incomingLine) {
        result.push(existingLine);
      } else {
        // Both lines exist but are different
        result.push(incomingLine); // Prefer incoming
      }
    }
    
    return result.join('\n');
  }

  private calculateSimilarity(lines1: string[], lines2: string[]): number {
    const set1 = new Set(lines1.map(line => line.trim()).filter(line => line));
    const set2 = new Set(lines2.map(line => line.trim()).filter(line => line));
    
    const intersection = new Set([...set1].filter(line => set2.has(line)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 1 : intersection.size / union.size;
  }

  private mergeValues(existing: any, incoming: any): any {
    if (Array.isArray(existing) && Array.isArray(incoming)) {
      return [...new Set([...existing, ...incoming])];
    }
    
    if (typeof existing === 'object' && typeof incoming === 'object') {
      return { ...existing, ...incoming };
    }
    
    // For primitive types, prefer incoming
    return incoming !== undefined ? incoming : existing;
  }

  private generateMergedVersion(existingVersion: string, incomingVersion: string): string {
    return `${existingVersion}+${incomingVersion}-${Date.now().toString(36)}`;
  }

  private generateVersionedId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Public utility methods
  async detectConflicts(existing: ContentItem, incoming: ContentItem): Promise<ConflictAnalysis> {
    return this.analyzeConflict(existing, incoming);
  }

  async canAutoResolve(existing: ContentItem, incoming: ContentItem): Promise<boolean> {
    const analysis = await this.detectConflicts(existing, incoming);
    return analysis.autoResolvable;
  }

  async suggestResolutionStrategy(existing: ContentItem, incoming: ContentItem): Promise<ConflictResolutionStrategy> {
    const analysis = await this.detectConflicts(existing, incoming);
    
    if (!analysis.hasConflict) {
      return { type: 'overwrite' };
    }
    
    if (analysis.autoResolvable) {
      return { type: 'merge', mergeRules: {} };
    }
    
    if (analysis.severity === 'high') {
      return { type: 'interactive' };
    }
    
    return { 
      type: 'merge', 
      mergeRules: {},
      allowHighSeverityMerge: false
    };
  }
}