
import * as React from 'react';
import AppState from './stores/AppState';
/*
    * webpack does static analysis over `import()` calls to split the app code
    * into chunks. We must include each import explicitly.
    */

export interface Route {
  // The actual route name, containing what URLs this route matches. 
  // For example for defining a route for /books - you'd pass `books'.
  // parameters can be passed with `:` express like syntax, for example `/books/:id/`
  route: string;
  // This is how you tell what route gets what component, the decision can be made asynchronously
  // and data fetching can also occur here. Typically you'd initialize the data a page needs 
  // to a consistent state here 
  getComponent?: (appState: AppState, params: object) => Promise<JSX.Element>;
  // This optionally (if passed) gets called after the routing happens. Server-Side-Rendering also 
  // waits for this to finish before the route actually changes. 
  // This is useful because routes typically need additional data loading logic _after_ they mount.
  // For example - a books component might require data after loading (and a loading indicator can be
  // shown in the meantime).
  onEnter?: (appState: AppState, params: object) => any | Promise<any>;
}

let routes: Route[];

const getRoute = p => p.then(mod => mod.default);

export const defaultRoute: Route = {
  route: '/',
  onEnter(appState: AppState) {
    appState.goTo('/add');
    return false;
  },
};

const authenticateRoute = (redirectToLogin = true) => async (appState: AppState, params) => {
  if (appState.state.loggedInAs === null) {
    appState.goTo('/login');
    return false;
    // await appState.refreshToken();
    // if (appState.loggedInAs === null) {
    //   if (redirectToLogin) {
    //     appState.goTo('/login');
    //   }
    // } else {
    //   appState.goTo('/add');
    // }
  }
};

routes = [{
  route: '/login',
  // onEnter: authenticateRoute(false),
  async getComponent(appState, params) {
    const Login = await getRoute(import('./components/Login'));
    return <Login appState={appState} />;
  }
}, {
  route: '/register',
  async getComponent(appState, params) {
    const Register = await getRoute(import('./components/Register'));
    return <Register appState={appState} />;
  }
}, {
  route: '/forgot',
  async getComponent(appState, params) {
    const Forgot = await getRoute(import('./components/Forgot'));
    return <Forgot appState={appState} />;
  }
}, {
  route: '/recover',
  async getComponent(appState, params) {
    const Recover = await getRoute(import('./components/Recover'));
    return <Recover appState={appState} />;
  }
}, {
  route: '/add',
  onEnter: authenticateRoute(),
  async getComponent(appState, params) {
    const Add = await getRoute(import('./components/Add'));
    return <Add appState={appState} />;
  }
}, {
  route: '/search',
  onEnter: authenticateRoute(),
  async getComponent(appState, params) {
    const Search = await getRoute(import('./components/Search'));
    return <Search appState={appState} />;
  }
}, {
  route: '/confirm',
  onEnter(appState: AppState) {
    appState.confirmAccount();
  },
  async getComponent(appState, params) {
    const Confirm = await getRoute(import('./components/Confirm'));
    return <Confirm appState={appState} />;
  }
}];

export default routes;

export { routes as routes };
