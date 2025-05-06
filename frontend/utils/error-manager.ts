class ErrorManager {
  private static shownErrors = new Set<string>();
  
  static shouldShowError(message: string): boolean {
    if (this.shownErrors.has(message)) {
      return false;
    }
    
    this.shownErrors.add(message);
    return true;
  }
  
  static resetErrors(): void {
    this.shownErrors.clear();
  }
}

export default ErrorManager;