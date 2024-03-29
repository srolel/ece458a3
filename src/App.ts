import { configure, observable, action } from 'mobx';
import { Router } from 'routes';
import { routes, defaultRoute, Route } from './routes';
import AppState from './stores/AppState';
configure({
  // enforceActions: true
});

const hasWindow = typeof window !== 'undefined';

// This class represents our main react application, you typically do not
// need to edit this code yourself at all.
class App {
  // the main element we're rendering, this reacts to route changes (MobX).
  @observable routeComponent: React.ReactElement<any> | null = null;
  @observable route: string | null = null;
  // our main app state, this is available in your router
  @observable appState: AppState;
  // our router
  router: Router<Route>;

  constructor(appState?: AppState, router?: Router<Route>) {
    // we optionally reload the state useful for hot reload and server-side rendering, 
    // but also as an extension point for restoring the data from localStorage.
    this.appState = new AppState().reload(appState);

    // initialize our router, or optionally pass it to the constructor
    if (!router) {
      this.router = Router<Route>();
      routes.forEach(r => this.router.addRoute(r.route, r));
    } else {
      this.router = router;
    }

    this.hookHistory();
  }

  @action setRouteComponent = (component) => {
    this.routeComponent = component;
  }

  async updateLocation(pathname = hasWindow ? location.pathname : '/') {
    const match = this.router.match(pathname);
    const params = match ? match.params : {};
    const route = match ? match.fn : defaultRoute;
    if (route.route !== this.route) {
      this.route = route.route;
      const onEnter = route.onEnter || (() => Promise.resolve(true));
      const shouldLoad = await onEnter.call(route, this.appState, params);
      if (shouldLoad !== false) {
        route.getComponent(this.appState, params).then(this.setRouteComponent);
      }
    }
  }

  pushState: any;
  replaceState: any;
  onpopstate: any;

  hookHistory() {
    if (typeof history !== 'undefined') {
      this.pushState = history.pushState;
      history.pushState = (...args) => {
        this.pushState.apply(history, args);
        this.updateLocation();
      }

      this.replaceState = history.replaceState;
      history.replaceState = (...args) => {
        this.replaceState.apply(history, args);
        this.updateLocation();
      }

      this.onpopstate = window.onpopstate;
      window.onpopstate = (e: PopStateEvent) => {
        if (this.onpopstate) this.onpopstate.apply(window, e);
        this.updateLocation();
      };

    }

    this.updateLocation();
  }

  unload() {
    window.onpopstate = this.onpopstate;
    history.pushState = this.pushState;
    history.replaceState = this.replaceState;
    this.appState.unload();
  }
}

export default App;
