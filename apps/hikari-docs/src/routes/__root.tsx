import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Layout } from '../components/layout';

export const Route = createRootRoute({
  component: () => (
    <>
      <Layout>
        <Outlet />
      </Layout>
      <TanStackRouterDevtools />
    </>
  ),
})
