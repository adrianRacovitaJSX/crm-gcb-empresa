import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { selectAuth } from '@/redux/auth/selectors';
import { AppContextProvider } from '@/context/appContext';
import PageLoader from '@/components/PageLoader';
import AuthRouter from '@/router/AuthRouter';

const ErpApp = lazy(() => import('./ErpApp'));
const Localization = lazy(() => import('@/locale/Localization'));

const DefaultApp = () => (
  <Localization>
    <AppContextProvider>
      <Suspense fallback={<PageLoader />}>
        <ErpApp />
      </Suspense>
    </AppContextProvider>
  </Localization>
);

// Selector original
const selectAuthData = state => state.auth;

// Selector refactorizado
const selectModifiedAuth = createSelector(
  [selectAuthData],
  auth => {
    // Realiza alguna transformación o cálculo en los datos de auth seleccionados
    // Por ejemplo, podrías agregar alguna propiedad adicional o filtrar los datos de alguna manera
    return {
      ...auth,
      // Realiza alguna transformación en los datos de auth si es necesario
    };
  }
);

export default function IdurarOs() {
  const { isLoggedIn } = useSelector(selectModifiedAuth);

  if (!isLoggedIn)
    return (
      <Localization>
        <AuthRouter />
      </Localization>
    );
  else {
    return <DefaultApp />;
  }
}
