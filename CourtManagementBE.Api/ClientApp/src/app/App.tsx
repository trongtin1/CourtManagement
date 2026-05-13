import { App as AntdApp, ConfigProvider, theme } from 'antd'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'

import { AuthEventBridge } from '@/app/providers/AuthEventBridge'
import { queryClient } from '@/app/providers/queryClient'
import { router } from '@/app/router'
import { store } from '@/store'

export function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#2563eb',
              borderRadius: 8,
              fontFamily:
                'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            },
            components: {
              Layout: {
                bodyBg: '#f6f8fb',
                headerBg: '#ffffff',
                siderBg: '#0f172a',
              },
            },
          }}
        >
          <AntdApp>
            <AuthEventBridge />
            <RouterProvider router={router} />
          </AntdApp>
        </ConfigProvider>
      </QueryClientProvider>
    </Provider>
  )
}
