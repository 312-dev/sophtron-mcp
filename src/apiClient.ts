import SophtronBaseClient from "./apiClient.base.js";
import config from "./config.js";

export class SophtronClient extends SophtronBaseClient {

  // Health check
  ping() {
    return this.get('/Institution/HealthCheckAuth');
  }

  // Institution search
  searchInstitutions(name: string) {
    return this.post('/Institution/GetInstitutionByName', { InstitutionName: name });
  }

  // User institution (bank connection) management
  getUserInstitutionsByUser() {
    return this.post('/UserInstitution/GetUserInstitutionsByUser', { UserID: config.SophtronApiUserId });
  }

  createUserInstitution(institutionId: string, username: string, password: string, pin?: string) {
    return this.post('/UserInstitution/CreateUserInstitution', {
      UserID: config.SophtronApiUserId,
      InstitutionID: institutionId,
      UserName: username,
      Password: password,
      PIN: pin || '',
    });
  }

  retryUserInstitution(userInstitutionId: string) {
    return this.post('/UserInstitution/RetryAddingUserInstitution', {
      UserInstitutionID: userInstitutionId,
    });
  }

  // Job management (connection status + MFA)
  getJobInfo(jobId: string) {
    return this.post('/Job/GetJobInformationByID', { JobID: jobId });
  }

  updateJobSecurityAnswer(jobId: string, answers: string) {
    return this.post('/Job/UpdateJobSecurityAnswer', {
      JobID: jobId,
      SecurityAnswer: answers,
    });
  }

  updateJobTokenChoice(jobId: string, tokenChoice: string) {
    return this.post('/Job/UpdateJobTokenInput', {
      JobID: jobId,
      TokenChoice: tokenChoice,
      TokenInput: null,
      VerifyPhoneFlag: null,
    });
  }

  updateJobTokenInput(jobId: string, tokenInput: string) {
    return this.post('/Job/UpdateJobTokenInput', {
      JobID: jobId,
      TokenChoice: null,
      TokenInput: tokenInput,
      VerifyPhoneFlag: null,
    });
  }

  updateJobTokenPhoneVerify(jobId: string, verified: boolean) {
    return this.post('/Job/UpdateJobTokenInput', {
      JobID: jobId,
      TokenChoice: null,
      TokenInput: null,
      VerifyPhoneFlag: verified,
    });
  }

  updateJobCaptchaInput(jobId: string, captchaInput: string) {
    return this.post('/Job/UpdateJobCaptcha', {
      JobID: jobId,
      CaptchaInput: captchaInput,
    });
  }

  // Accounts
  getUserInstitutionAccounts(userInstitutionId: string) {
    return this.post('/UserInstitution/GetUserInstitutionAccounts', {
      UserInstitutionID: userInstitutionId,
    });
  }

  refreshAccount(accountId: string) {
    return this.post('/UserInstitutionAccount/RefreshUserInstitutionAccount', {
      AccountID: accountId,
    });
  }

  // Transactions
  getTransactions(accountId: string, startDate: Date, endDate: Date) {
    return this.post('/Transaction/GetTransactionsByTransactionDate', {
      AccountID: accountId,
      StartDate: startDate.toISOString(),
      EndDate: endDate.toISOString(),
    });
  }
}
