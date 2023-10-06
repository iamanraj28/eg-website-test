import React from 'react'
import { Center, NativeBaseProvider } from 'native-base'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Loading from './Loading'
import Alert from './Alert'

const AppRoutesContainer = ({
  theme,
  routes,
  basename,
  footerLinks,
  appName,
  alert,
  setAlert,
  ...otherProps
}: any) => {
  // const user = useAuthFlow()
  return (
    <NativeBaseProvider {...(Object.keys(theme).length ? { theme } : {})}>
      <Alert {...{ alert, setAlert }} />
      <React.Suspense
        fallback={
          <Center>
            <Loading />
          </Center>
        }
      >
        <Router basename={basename}>
          <Routes>
            {routes.map((item: any, index: number) => (
              <Route
                key={item?.path}
                path={item?.path}
                element={
                  <item.component
                    {...{ footerLinks, appName, setAlert, ...otherProps }}
                    {...item?.props}
                  />
                }
              />
            ))}
          </Routes>
        </Router>
      </React.Suspense>
    </NativeBaseProvider>
  )
}

export default AppRoutesContainer
