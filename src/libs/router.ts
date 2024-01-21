import { HttpMethod } from './api-gateway';

type Handler = (event: any) => Promise<any>;

type Route = {
  method: HttpMethod;
  path: string;
  handler: Handler;
};

export class Router {
  private readonly routes: Route[] = [];

  add(method: HttpMethod, path: string, handler: (event: any) => Promise<any>) {
    this.routes.push({ method, path, handler });
  }

  async handle(method: HttpMethod, path: string, body: any) {
    const route = this.routes.find((route) => {
      if (route.method !== method) {
        return false;
      }

      if (route.path !== path) {
        return false;
      }

      return true;
    });

    if (!route) {
      throw new Error('Route not found.');
    }

    return await route.handler(body);
  }
}
