import React from 'react'

const LoadingScreen = ({ title = 'Loading your workspace...', subtitle = 'Preparing the next step in your interview flow.' }) => {
  return (
    <main className="loading-screen" aria-live="polite" aria-busy="true">
      <div className="loading-screen__card">
        <div className="loading-screen__spinner" aria-hidden="true">
          <span />
        </div>

        <h1 className="loading-screen__title">{title}</h1>
        {subtitle ? <p className="loading-screen__subtitle">{subtitle}</p> : null}
      </div>
    </main>
  )
}

export default LoadingScreen