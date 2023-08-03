
export declare type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}

export declare type StyleObject = {
  id: number;
  parts: StyleObjectPart[];
};

export declare function addStyles(styles:Array<StyleObject>, shadowRoot:ShadowRoot) {
  
}