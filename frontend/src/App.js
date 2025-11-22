<Routes>
  {/* Rutas PÚBLICAS (Cualquiera entra) */}
  <Route path="/" element={<HomePage />} />
  <Route path="/tabla" element={<StandingsPage />} />
  <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
  
  {/* 👇 ESTA DEBE ESTAR AQUÍ, COMO PÚBLICA 👇 */}
  <Route path="/partidos" element={<MatchesPage />} /> 
  
  {/* Ruta Privada (Solo Admin) */}
  <Route
    path="/equipos"
    element={
      <ProtectedRoute>
        <TeamsPage />
      </ProtectedRoute>
    }
  />
  {/* ... otras rutas ... */}
</Routes>