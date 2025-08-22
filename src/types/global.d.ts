// Global type declarations for test environment
declare global {
  var Image: {
    new(): HTMLImageElement;
  };
  
  namespace NodeJS {
    interface Global {
      Image: {
        new(): HTMLImageElement;
      };
      URL: {
        createObjectURL: (object: Blob | MediaSource) => string;
        revokeObjectURL: (url: string) => void;
      };
    }
  }
}

export {};
