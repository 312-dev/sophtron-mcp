import SophtronBaseClient from "./apiClient.base.js";

export class SophtronClient extends SophtronBaseClient {

  // Customer management
  async getCustomer(name: string) {
    const customers = await this.get(`/v2/customers/?uniqueId=${encodeURIComponent(name)}`);
    return customers?.[0];
  }

  async createCustomer(uniqueId: string) {
    return this.post('/v2/customers/', { UniqueId: uniqueId });
  }

  // Members (bank connections)
  getMembers(customerId: string) {
    return this.get(`/v2/customers/${customerId}/members`);
  }

  // Accounts
  getAccountsV3(customerId: string) {
    return this.get(`/v3/customers/${customerId}/accounts`);
  }

  getMemberAccountsV3(customerId: string, memberId: string) {
    return this.get(`/v3/customers/${customerId}/Members/${memberId}/accounts`);
  }

  getAccountV3(customerId: string, memberId: string, accountId: string) {
    return this.get(`/v3/customers/${customerId}/Members/${memberId}/accounts/${accountId}`);
  }

  // Transactions
  getTransactions(customerId: string, accountId: string, startTime: Date, endTime: Date) {
    const path = `/v2/customers/${customerId}/accounts/${accountId}/transactions?startDate=${startTime.toISOString().substring(0, 10)}&endDate=${endTime.toISOString().substring(0, 10)}`;
    return this.get(path);
  }

  getTransactionsV3(customerId: string, accountId: string, startTime: Date, endTime: Date) {
    const path = `/v3/customers/${customerId}/accounts/${accountId}/transactions?startDate=${startTime.toISOString().substring(0, 10)}&endDate=${endTime.toISOString().substring(0, 10)}`;
    return this.get(path);
  }

  // Identity
  getIdentityV3(customerId: string, memberId: string) {
    return this.get(`/v3/Customers/${customerId}/Members/${memberId}/identity`);
  }

  // Institutions
  async searchInstitutions(name: string) {
    return this.get(`/v2/institutions/?name=${encodeURIComponent(name)}`);
  }
}
