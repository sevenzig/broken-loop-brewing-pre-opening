export interface BeerStyleInfo {
    style_code: string;
    style_name: string;
    category: string;
    category_name: string;
    overall_impression: string;
    aroma?: string;
    appearance?: string;
    flavor?: string;
    mouthfeel?: string;
    history?: string;
    comments?: string;
    vital_stats?: {
        og: string;
        fg: string;
        ibu: string;
        srm: string;
        abv: string;
    };
    commercial_examples?: {
        american?: string[];
        english?: string[];
        other?: string[];
    };
    tags?: string[];
}
export declare function parseStyleMarkdown(content: string): BeerStyleInfo;
export declare function loadAllStyles(): Promise<BeerStyleInfo[]>;
export declare function loadStyleByCode(styleCode: string): Promise<BeerStyleInfo | null>;
export declare function loadStyleInfo(styleName: string): Promise<BeerStyleInfo | null>;
export declare function createFallbackStyleInfo(styleName: string): BeerStyleInfo;
