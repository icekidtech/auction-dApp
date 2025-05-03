import { LiskBridgeAdapter } from '../../blockchain/ignition/modules/lisk-adapter';

/**
 * Helper class for Lisk authentication in the frontend
 */
export class LiskAuth {
  private static adapter: LiskBridgeAdapter;
  
  /**
   * Initialize the Lisk authentication system
   */
  static init(contractAddress: string, rpcUrl: string) {
    this.adapter = new LiskBridgeAdapter(contractAddress, rpcUrl);
  }
  
  /**
   * Connect with a Lisk wallet
   * @param privateKey The private key from the wallet
   * @returns The Lisk address associated with the wallet
   */
  static connectWallet(privateKey: string): string {
    if (!this.adapter) {
      throw new Error('LiskAuth not initialized. Call init() first.');
    }
    
    // Store address in local storage for session persistence
    const address = this.adapter.connectLiskWallet(privateKey);
    localStorage.setItem('liskAddress', address);
    
    return address;
  }
  
  /**
   * Get the currently connected Lisk address
   * @returns The connected address or null if not connected
   */
  static getCurrentAddress(): string | null {
    return localStorage.getItem('liskAddress');
  }
  
  /**
   * Check if a user is currently authenticated
   * @returns True if authenticated, false otherwise
   */
  static isAuthenticated(): boolean {
    return localStorage.getItem('liskAddress') !== null;
  }
  
  /**
   * Disconnect the current wallet
   */
  static disconnectWallet(): void {
    localStorage.removeItem('liskAddress');
  }
}