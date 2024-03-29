import { observable, action, runInAction, computed } from 'mobx';
import { Login } from '../components/Login';
import { Search } from '../components/Search';
import { Add } from '../components/Add';
import { encrypt, decrypt, validateHexToken } from '../../webpack/crypto';
import { readCookie } from './utils';

export interface Site {
  id: number,
  site: string;
  site_username: string;
  site_password: string;
}

/*
* This is the entry point for the app's state. All stores should go here.
*/
export class AppState {

  @observable state = {
    loggedInAs: null as string | null,
    masterKey: null as string | null,
    searchTerm: '',
    searchResults: null as Site[] | null,
  }

  @action
  resetState() {
    this.state.loggedInAs = null;
    this.state.masterKey = null;
    this.state.searchResults = null;
    this.state.searchTerm = '';
  }

  setSearchTerm(value: string) {
    this.state.searchTerm = value;
  }

  @computed get encrypt() {
    return encrypt(this.state.masterKey);
  }

  @computed get decrypt() {
    return decrypt(this.state.masterKey);
  }

  onUnauthorized() {
    this.resetState();
    this.goTo('/login');
  }

  async searchForSites() {
    this.state.searchResults = null;
    this.goTo('/search');
    const res = await this.apiRequest(`/passwords/search`, {
      method: 'POST',
      body: JSON.stringify({
        site: this.state.searchTerm,
        csrfToken: readCookie('csrfToken')
      })
    });
    const encryptedResults = await res.json() as Site[];
    this.state.searchResults = encryptedResults.map(x => ({
      id: x.id,
      site: x.site,
      site_username: this.decrypt(x.site_username),
      site_password: this.decrypt(x.site_password),
    }))
  }

  async refreshToken() {
    try {
      const res = await this.apiRequest('refresh', {
        method: 'POST',
        body: JSON.stringify({
          csrfToken: readCookie('csrfToken')
        })
      });

      const user = await res.json();

      runInAction(() => {
        this.state.loggedInAs = user.username;
      });
    } catch (e) {
      console.error(e);
    }
  }

  goTo = (url: string, replace = false) =>
    replace
      ? history.replaceState(null, "", url)
      : history.pushState(null, "", url)

  apiRequest = async (path: string, init?: RequestInit) => {
    const res = await fetch(`/api/${path.replace(/^\//, '')}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      ...init,
    });

    if (res.status === 401) {
      this.onUnauthorized();
    }

    if (res.status !== 200) {
      throw new Error(res.statusText);
    }

    return res;
  }

  async login(form: { username: string, password: string }) {
    const { username, password } = form;
    const res = await this.apiRequest('login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
      })
    });
    runInAction(() => {
      this.state.loggedInAs = username;
      this.state.masterKey = password;
    });
    this.goTo('/add');
  }

  async register(form: { username: string, email: string, password: string }) {
    await this.apiRequest('register', {
      method: 'POST',
      body: JSON.stringify({
        username: form.username,
        email: form.email,
        password: form.password,
      })
    });
  }

  async forgotPassword(form: { email: string }) {
    await this.apiRequest('forgot-password', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
      })
    });
  }

  async changePassword(form: { password: string }) {
    const params = new URLSearchParams(location.search.slice(1));
    const token = params.get('token');
    if (!token) throw new Error('could not change password');
    if (!validateHexToken(token)) throw new Error('token tampered with!');
    await this.apiRequest('change-password', {
      method: 'POST',
      body: JSON.stringify({
        password: form.password,
        token
      })
    });
  }
  @observable confirmAccountStatus: 'start' | 'success' | 'failure' = 'start';

  async confirmAccount() {
    this.confirmAccountStatus = 'start';
    try {
      const params = new URLSearchParams(location.search.slice(1));
      const token = params.get('token');
      if (!token) throw new Error('could not confirm account');
      if (!validateHexToken(token)) throw new Error('token tampered with!');
      await this.apiRequest(`confirm`, {
        method: 'POST',
        body: JSON.stringify({
          token
        })
      });
      this.confirmAccountStatus = 'success';
    } catch (e) {
      console.error(e);
      this.confirmAccountStatus = 'failure';
    }
  }

  async addSite(form: { site: string, site_password: string, site_username: string }) {
    const site_username = await this.encrypt(form.site_username);
    const site_password = await this.encrypt(form.site_password);
    const res = await this.apiRequest('passwords', {
      method: 'POST',
      body: JSON.stringify({
        site: form.site,
        site_password,
        site_username,
        csrfToken: readCookie('csrfToken')
      })
    });
  }

  logout = async () => {
    try {
      await this.apiRequest('logout', {
        method: 'POST',
      });
    } finally {
      this.onUnauthorized();
    }
  }

  @action
  reload(store?: AppState) {
    if (store) {
      Object.assign(this.state, store.state);
    }
    return this;
  }

  unload() {

  }
}

export default AppState;