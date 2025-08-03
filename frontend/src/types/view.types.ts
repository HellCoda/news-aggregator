export type ViewMode = 'list' | 'grid-3' | 'grid-4';

export interface ViewConfig {
  mode: ViewMode;
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showImage: boolean;
  cardSize: 'compact' | 'medium' | 'small';
}

export const VIEW_CONFIGS: Record<ViewMode, ViewConfig> = {
  'list': {
    mode: 'list',
    columns: { mobile: 1, tablet: 2, desktop: 2 },
    showImage: false,
    cardSize: 'compact'
  },
  'grid-3': {
    mode: 'grid-3',
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    showImage: true,
    cardSize: 'medium'
  },
  'grid-4': {
    mode: 'grid-4',
    columns: { mobile: 1, tablet: 3, desktop: 4 },
    showImage: true,
    cardSize: 'small'
  }
};
